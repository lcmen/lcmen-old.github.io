---
layout: default
title: Installing Epson L3060 scanner on Linux
date: 2021-08-08
parent: Unix
---

# Installing Epson L3060 scanner on Linux

A few months ago I bought Epson L3060 all-in-in one printer as it was one of the few devices at my local store that was
supposed to be fully working with Linux (according to the manufacturer).

Unfortunately, despite having official drivers for Linux, I was never able to make the scanner working on Linux through wi-fi. The official image scan app didn't work, even after providing a fixed IP address via config file - it still couldn't save the file after generating a preview (not to mention that the app looked terrible under GTK based desktop environment).

I also tried to pair it with the [simple-scan](https://launchpad.net/simple-scan){:target="_blank"} app (which looks much better btw.) with the official driver but I couldn't start scanning - the app was spinning, and eventually nothing happened. 

Just recently, I've found about [sane-airscan](https://github.com/alexpevzner/sane-airscan){:target="_blank"} project which is a backend for network scanners. It promises to work with scanning devices connected to the network without any additional drivers. Since I didn't have anything to lose, I decided to give it a shot.

It turned out that my scanner was discovered by `simple-scan` without any additional configuration, and I was able to scan and save documents without any issues.

I'm currently running Ubuntu 20.04 LTS, so I had to add ppa to install it (it's not needed on 20.10+ versions):

```shell
curl -fsSL https://download.opensuse.org/repositories/home:pzz/xUbuntu_20.04/Release.key |  sudo apt-key add -
sudo add-apt-repository 'deb http://download.opensuse.org/repositories/home:/pzz/xUbuntu_20.04/ /'
sudo apt update
sudo apt install sane-airscan
```

Then I needed to install `simple-scan`:

```shell
sudo apt install simple-scan
```

After that, I just had to turn on my printer, launch the `simple-scan` and I could start scanning. Magic!
