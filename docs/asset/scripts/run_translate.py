"""
run_translate.py  —  自动读取 Windows 注册表中的 QWEN_API_KEY 并启动批量翻译

用法：
    python run_translate.py
"""
import os
import sys
import subprocess

def get_key_from_registry():
    try:
        import winreg
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment")
        val, _ = winreg.QueryValueEx(key, "QWEN_API_KEY")
        return val
    except Exception:
        return None

def main():
    # 1. 优先用当前进程环境变量
    api_key = os.environ.get("QWEN_API_KEY", "")

    # 2. 若当前进程环境变量没有，从注册表读
    if not api_key:
        api_key = get_key_from_registry()

    if not api_key:
        print("错误：找不到 QWEN_API_KEY，请先设置 Windows 用户环境变量")
        sys.exit(1)

    print(f"QWEN_API_KEY 已加载（长度 {len(api_key)}）")

    # 脚本目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "../.."))
    translate_script = os.path.join(script_dir, "translate_html.py")
    en_dir = os.path.join(project_root, "manual", "en")
    zh_dir = os.path.join(project_root, "manual", "zh")

    env = os.environ.copy()
    env["QWEN_API_KEY"] = api_key

    cmd = [
        sys.executable,
        translate_script,
        "--batch", en_dir, zh_dir,
        "--api", "qwen",
    ]
    print(f"启动翻译：{' '.join(cmd)}\n")

    proc = subprocess.run(cmd, env=env)
    sys.exit(proc.returncode)

if __name__ == "__main__":
    main()
