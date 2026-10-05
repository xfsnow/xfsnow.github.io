# WorkBuddy Auto Check-in Without Keeping Your PC On

Published: *2026-10-05 10:10:00*

Category: __AI__

Summary: This article shares a PC-free check-in solution: extract the refresh_token from the desktop client, deploy a Python script with a Cron scheduled task on a Linux VM, and rely on the token self-renewal mechanism for long-term automatic check-ins. The script uses only the standard library, and the token is permission-isolated for security—suitable for technical readers with Linux and Python basics.

---------

> Suitable for readers with basic Python skills who can manage a Linux VM; if you're not familiar, you can also hand this article to any AI assistant and have it adapt the script to your environment so it runs.

## 1. Background: Why Automate the Check-in

WorkBuddy's "Buddy Gas Station" lets you earn platform credits by checking in daily. Credits are valid for 30 days, and consecutive check-ins bring extra rewards. But the catch is—**you have to remember to open the client and tap once every single day**.

Human memory is unreliable: a business trip, a late night, or a dead phone—any single missed check-in breaks the streak. And such promotional campaigns usually offer no "make-up check-in" mechanism.

So the goal is clear: **on a 7×24 always-on VM, automatically complete "refresh login token → check in" on a schedule every day, ideally configured once and maintenance-free for the long run.**

## 2. Overall Design

The whole solution needs only two parts:

1. **A one-time bootstrap step**: extract the `refresh_token` from the WorkBuddy desktop client that is logged in on your local machine. This step is done only once (or re-done when the token expires).
2. **A resident script + cron**: run `daily_checkin.py` on the VM, triggered at 09:00 / 21:00 (Beijing time) every day, automatically refreshing the token, checking in, and writing **the new token back**—this "self-renewal" mechanism achieves long-term maintenance-free operation.

A few key design trade-offs:

- **Zero third-party dependencies**: `daily_checkin.py` uses only the Python standard library (`urllib` / `json` / `os` / `datetime`), so no `pip` packages need to be installed on the VM.
- **Token stays out of the repo**: the `refresh_token` is effectively your account key; store it under `~/.ssh/` on the VM with `600` permissions, and exclude it via `.gitignore`—never commit it.
- **Idempotent**: the API itself supports an "already checked in today" state, so repeated triggers are safe; that's why setting two fallback times per day is harmless.

## 3. Technical Principles Breakdown

### 3.1 Where the Token Comes From: Envelope Encryption + In-Memory Seed

The WorkBuddy desktop client stores the login state in `workbuddy-desktop.info`, where the `auth.refreshToken` field is **AES-256-GCM envelope encrypted**. The difficulty isn't the algorithm—it's that **the decryption seed (key) exists only in the memory of the logged-in, running WorkBuddy process**; the file alone gives you no key.

The bootstrap script does the following:

1. Scan the WorkBuddy process memory and collect a batch of candidate key seeds;
2. Try decrypting the envelope one by one (automatically skipping those with a mismatched keyId or failed GCM tag verification);
3. Use the recovered `refresh_token` to actually call "refresh + check-in" once to verify it works;
4. Print only the `refresh_token` that passes verification.

> This step must be run once on a machine **with WorkBuddy installed and logged in**. After that, the VM side needs no WorkBuddy client at all.

### 3.2 What the Core Script Does

The skeleton of `daily_checkin.py` is very straightforward; below is the minimal illustration (not the full source):

```python
import os, json, urllib.request as ureq
from datetime import datetime, timezone, timedelta

API = "https://copilot.tencent.com"
# default fallback path; production usually overrides via env var
TOKEN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "refresh_token.txt")

def _ts():
    # Output Beijing time consistently so logs aren't confused by timezones
    return datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S") + " +08:00"

def load_token():
    # Priority: env var > specified file > file alongside the script
    if os.environ.get("WORKBUDDY_REFRESH_TOKEN"):
        return os.environ["WORKBUDDY_REFRESH_TOKEN"].strip()
    f = os.environ.get("WORKBUDDY_REFRESH_TOKEN_FILE")
    if f and os.path.isfile(f):
        return open(f).read().strip()
    if os.path.isfile(TOKEN_FILE):
        return open(TOKEN_FILE).read().strip()
    return None

def save_token(tok):
    # Self-renewal write-back: prefer the file specified by the env var
    target = os.environ.get("WORKBUDDY_REFRESH_TOKEN_FILE") or TOKEN_FILE
    open(target, "w").write(tok)

def refresh(rt):
    # POST /v2/plugin/auth/token/refresh
    # Headers: X-Refresh-Token / X-Auth-Refresh-Source: plugin / X-Domain: copilot.tencent.com
    # returns (new_refresh_token, raw_resp)
    ...

def checkin(access_token):
    # POST /v2/billing/meter/daily-checkin, Bearer auth
    # code=0 success; code=10001 already checked in today (idempotent)
    ...

def main():
    rt = load_token()
    new_rt, resp = refresh(rt)
    at = resp["data"]["accessToken"]
    if new_rt and new_rt != rt:
        save_token(new_rt)          # ← this is the "self-renewal"
        log("refresh_token self-renewed and written back to file")
    checkin(at)
```

As you can see, the core of this "automation" is just two things: **swap the old refresh_token for a new one** (the refresh endpoint natively supports rotation), and **write the new one back**.

### 3.3 Self-Renewal: Why It Keeps Running

This is the key to the solution's "long-term maintenance-free" operation. Each run:

1. Take the current `refresh_token` to the refresh endpoint;
2. The server returns **a new** `refresh_token`;
3. The script writes it back to `WORKBUDDY_REFRESH_TOKEN_FILE`;
4. The next cron run already reads the new token.

Because a new refresh_token is rotated out every time, as long as the server keeps issuing them, this chain won't break—the script contains **no logic like "stop after day N of check-ins"**. So, provided the account session isn't invalidated and the campaign isn't taken down, it can auto-renew indefinitely.

The only situations that interrupt it and require your intervention are:

- You **log out / change password / get kicked off by risk control** in the WorkBuddy client → the refresh token becomes invalid and the script exits with code `1`. At that point, just re-run the bootstrap script to fetch a new token and overwrite.
- The official side **takes down the check-in campaign or changes the API** → check-in errors (renewal may still work until the login state expires).

### 3.4 Storing the Token Securely: Don't Commit the Key

The `refresh_token` is effectively your account key—it can log in and call APIs on your behalf. When deploying, be sure to:

```bash
# Place it outside the repo and lock down permissions
printf '%s' "<your refresh_token>" > ~/.ssh/refresh_token.txt
chmod 600 ~/.ssh/refresh_token.txt
```

And exclude it in the root `.gitignore`:

```gitignore
/AI/WorkBuddy/*.txt
/AI/WorkBuddy/*.log
```

Cron feeds the token to the script via environment variables, so the script directory holds **no plaintext token file**:

```cron
# The VM's system timezone is UTC, and not all cron implementations honor CRON_TZ
# (e.g., Ubuntu's Vixie cron 3.0pl1 ignores it), so write times directly in UTC:
# Beijing 09:00 = UTC 01:00, 21:00 = UTC 13:00
0 1,13 * * * cd /path/to/workbuddy && \
  WORKBUDDY_REFRESH_TOKEN="$(cat ~/.ssh/refresh_token.txt)" \
  WORKBUDDY_REFRESH_TOKEN_FILE=~/.ssh/refresh_token.txt \
  python3 daily_checkin.py >> checkin.log 2>&1
```

- Timezone note: not all cron implementations support `CRON_TZ` (e.g., some Ubuntu Vixie cron 3.0pl1 ignores it, treating it as a normal environment variable and still interpreting times in system UTC). The safe approach is to **write the times in the VM's actual timezone**—this machine's timezone is UTC, so Beijing time 09:00/21:00 correspond to UTC 01:00/13:00, i.e. `0 1,13 * * *`. If your VM's system timezone is already `Asia/Shanghai`, you can simply write `0 9,21`.
- `WORKBUDDY_REFRESH_TOKEN` lets the script get the token directly (without reading a file in the script directory);
- `WORKBUDDY_REFRESH_TOKEN_FILE` sets the **self-renewal write-back target** to `~/.ssh`.

## 4. API Reference

The following APIs were reverse-engineered from the WorkBuddy desktop client and verified to work:

| Purpose | Method / Path | Auth | Notes |
|------|-------------|------|------|
| Refresh token | `POST /v2/plugin/auth/token/refresh` | Headers `X-Refresh-Token` / `X-Auth-Refresh-Source: plugin` / `X-Domain: copilot.tencent.com` | Returns `accessToken` + `refreshToken` (self-renewal) |
| Daily check-in | `POST /v2/billing/meter/daily-checkin` | `Authorization: Bearer <accessToken>` | `code=0` success; `code=10001` already checked in today (idempotent) |
| Streak status | `POST /v2/billing/meter/checkin-activity-status` | `Authorization: Bearer <accessToken>` | Returns `streak_days` / `total_credits` |
| Domain | `https://copilot.tencent.com` | — | Common prefix |

## 5. Conclusion

Once this solution is in place, your local machine doesn't need to be powered on or run WorkBuddy—the credits still arrive daily; the token auto-renews via refresh rotation, so you basically don't have to touch it. The only things you really need to worry about are "don't log out of the client" and "don't let the official campaign be taken down".

If this article was helpful, feel free to **follow my WeChat official account "Tech Warm Life"** and send me a direct message "**WorkBuddy Check-in**" to get the complete runnable source code (including the token extraction script `extract_refresh_token.py`, deployment instructions, and a troubleshooting checklist). Once you have the source, pair it with any AI assistant to adjust the paths for your VM environment and it'll run.
