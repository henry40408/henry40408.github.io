+++
title = 'Hugo Refused to Connect on WSL2'
date = 2024-09-30T21:43:20+08:00
+++

It has been a while since I wrote the latest post on my blog. Recently, I started a development server for Hugo on my Windows machine, but I kept encountering a "Refused to connect" error in the browser. I searched the Internet and found that someone had encountered the same issue: [Hugo local development serve stopped working](https://discourse.gohugo.io/t/hugo-local-development-serve-stopped-working/30109/5). So, I changed the bound port to 3000, the port I use for my Nuxt.js and Ruby on Rails applications:

```
hugo -D --port 3000 # -D: build drafts
```

It works again now. It's not ideal because I should find the root cause of why port 1313 is not available, but it just works.

- OS: NixOS 24.05.20240810.a781ff3 (Uakari) x86_64
- Host: Windows Subsystem for Linux - NixOS (2.2.4)
- Kernel: Linux 5.15.153.1-microsoft-standard-WSL2
- Brave browser: v1.70.119
