+++
title = 'Blog on IPFS with ENS'
date = 2024-09-30T22:38:08+08:00
+++

## Terms

- [ENS](https://ens.domains): The Ethereum Name Service (ENS) is a distributed, open, and extensible naming system based on the Ethereum blockchain.
- [IPFS](https://ipfs.tech/): The InterPlanetary File System (IPFS) is a set of composable, peer-to-peer protocols for addressing, routing, and transferring content-addressed data in a decentralized file system.
- [IPNS](https://docs.ipfs.tech/concepts/ipns/): The InterPlanetary Name System (IPNS) is a system for creating mutable pointers to CIDs known as names or IPNS names. IPNS names can be thought of as links that can be updated over time, while retaining the verifiability of content addressing.

## Background

I have heard about IPFS for a while, but I couldn't figure out how it works each time I tried. I have been subscribed to [Vitalik Buterin's website](https://vitalik.eth.limo/) for some time, and the RSS feed has been broken since I subscribed. They published [an article](https://vitalik.eth.limo/general/2024/09/28/alignment.html) on September 28th, 2024, and I can't open it in my RSS reader. I can't tolerate it anymore, so I fixed it by hosting an RSS bridge on my Raspberry Pi. It's not a difficult task; I just ran the RSS bridge and put the following custom bridge in the data directory, and everything worked as expected. If you have also subscribed to their website, the following code might help:

```php
<?php
class VitalikBridge extends FeedExpander
{
    const MAINTAINER = 'henry40408';
    const NAME = "Vitalik Buterin's website";
    const URI = 'https://vitalik.eth.limo';
    const DESCRIPTION = "Vitalik Buterin's website";
    const PARAMETERS = [];
    const CACHE_TIMEOUT = 3600;

    public function collectData()
    {
        $this->collectExpandableDatas('https://vitalik.eth.limo/feed.xml');
    }

    protected function parseItem(array $item)
    {
        // rewrite URL from vitalik.ca to vitalik.eth.limo
        $item['uri'] = str_replace('vitalik.ca','vitalik.eth.limo',$item['uri']);
        return $item;
    }
}
```

After I fixed the issue, I started wondering which service Vitalik uses to host his website, so I navigated to [eth.limo](https://eth.limo) and found that it's actually a Web 2.0 domain name "alias" of his ENS domain name [vitalik.eth](https://app.ens.domains/vitalik.eth). I read the landing page and found that it supports IPFS, so I am determined to figure out how they work this time.

## ENS

I won't focus on how to get an ENS domain name because it's well introduced in the [official documentation](https://docs.ens.domains/learn/protocol). My ENS domain name is [henry40408.eth](https://app.ens.domains/henry40408.eth).

## IPFS

Here is the tricky part that I spent most of my time figuring out. I will briefly explain the concepts here. For more information, please consult the [IPFS documentation](https://docs.ipfs.tech/concepts/).

### Content on IPFS is NOT Permanent

Every piece of content on IPFS will perish if no one accesses it for a while, and the last IPFS node which caches it runs garbage collection. It will be lost forever in the IPFS network, so the statement that content on IPFS is permanent is semi-correct. If it's popular, it will be nearly permanent on the IPFS network; but if it's rarely accessed, it will be lost. So if someone claims that content is permanent, it's not true. Even the inventor [Juan Benet](https://juan.benet.ai/) initially claimed that IPFS is permanent in his [talk](https://sourcegraph.com/blog/ipfs-the-permanent-web-by-juan-benet), which I think is misleading:

{{< youtube id=Fa4pckodM9g loading=lazy >}}

On the IPFS website, there is a page called [Persistence, permanence, and pinning](https://docs.ipfs.tech/concepts/persistence/), which explains the differences and how IPFS works. I highly recommend that everyone who wants to get involved in the IPFS network should read it.

To keep my website "persistent", I have two options: use a pinning service or run an IPFS node on my own. I chose the latter because I have a Synology NAS which runs 24/7. I considered a Raspberry Pi, but since an IPFS node might consistently read and write, it could dramatically reduce the lifespan of the SD card. It's easy to [run an IPFS node inside Docker](https://docs.ipfs.tech/install/run-ipfs-inside-docker/).

## IPNS

I won't focus on IPNS here, either. For more information, please consult the [IPNS documentation](https://docs.ipfs.tech/concepts/ipns/). I assume that you have already read the documentation.

In case you haven't noticed yet, I build my website with [Hugo](https://gohugo.io/).

After I started the node, I faced a problem: since I primarily work on my Windows workstation, I have to build the website with Hugo, copy the artifact to my NAS, then run the following commands on the NAS terminal:

```sh
$ CID="$(ipfs add -r -Q public/)"
$ ipfs name publish "/ipfs/$CID"
```

It bothered me that I had to switch back and forth, so I wanted to find a way to publish my content to the same IPNS name on my Windows machine and pin the content with my IPFS node. After searching, I found a thread that discusses my need: [Several IPFS nodes with the same keys?](https://discuss.ipfs.tech/t/several-ipfs-nodes-with-the-same-keys/13485/2) Even though sharing the same peer ID by copying the data directory is "a big no-no," the moderator suggested that I can share the key between IPFS nodes, and then I can deploy my content to the same IPNS name. Here's how I did it:

On my NAS, generate a new key called "ipns" (you can name it anything you like), then export it:

```sh
$ ipfs key gen ipns
$ ipfs key export ipns
```

After the `ipfs key export` command, a file called `ipns.key` will be placed in the current directory. Copy the file to the Windows machine, and import it:

```sh
ipfs key import ipns ipns.key
```

After the key is imported, I can run the following commands to deploy content to the same IPNS name:

```sh
$ CID="$(ipfs add -r -Q public/)"
$ ipfs name publish --key=ipns "/ipfs/$CID"
```

# Pin Content with IPNS Name

After deploying content with the `ipfs name publish` command on the Windows machine, you can pin the content with the following command on your NAS (assuming the IPNS name is `k51qzi5uqu5dgy6fu9073kabgj2nuq3qyo4f2rcnn4380z6n8i4v2lvo8dln6l`):

```sh
ipfs pin add /ipns/k51qzi5uqu5dgy6fu9073kabgj2nuq3qyo4f2rcnn4380z6n8i4v2lvo8dln6l
```

# Closing Words

The key is sharing the private key between IPFS nodes. I hope this post will help you. From now on, although my website will still be hosted on GitHub Pages as [henry40408.com](henry40408.com), I suggest everyone access [henry40408.eth.limo](https://henry40408.eth.limo) instead. It not only helps make my website more persistent but also helps IPFS thrive.
