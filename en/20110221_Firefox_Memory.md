# Reducing Firefox Memory Usage

Published: *2011-02-21 17:23:00*

Category: __Tools__

Summary: Translating a foreign article that I tested in practice and found quite effective in solving Firefox's excessive memory usage.

---------

I've been using machines with limited resources recently, and I felt I had to deal with Firefox's excessive memory usage. I found a good article online, translated it briefly, kept a record for myself, and am sharing it with everyone.

Original address: http://www.zolved.com/synapse/view_content/24939/How_to_reduce_the_memory_usage_on_Firefox

Some screenshots in the original article are from older versions of Firefox. I'll provide interface operation instructions based on my current version 3.6.13.

1. Try to use fewer Firefox extensions, only install necessary extensions, don't install too many themes, and delete unused ones immediately.

2. Check plugins regularly and update them in time, uninstall plugins you don't use.

3. Don't record download history.
   Tools menu > Options, Privacy tab, select "Never remember history".

4. If you use Firefox for extended periods, it's recommended to restart it regularly, as it will occupy more and more memory over time.

5. Enable Firefox's memory cache
   Enter `about:config` in the address bar. When encountering the security warning page, you can only select "I'll be careful" to continue modifying the configuration.
   Enter `browser.cache.memory.enable` in the filter bar and confirm its value is `true`. If not, double-click to make it `true`.
   Right-click in a blank area, select "New" > "Integer", enter `browser.cache.memory.capacity`, and confirm. Enter a value based on your computer's memory - 1/64 of total memory. For example, if you have 512MB memory, enter "8192".

6. Release memory when minimizing Firefox
   Open `about:config` as above, create a new Boolean value named `config.trim_on_minimize` with a value of `true`.

After completing the above configurations, restart Firefox for them to take effect.

---
*Original link: [https://snowpeak.blog.csdn.net/article/details/6198193](https://snowpeak.blog.csdn.net/article/details/6198193)*