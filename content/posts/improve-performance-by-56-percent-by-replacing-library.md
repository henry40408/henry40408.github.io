+++
title = "Improve Performance by 56% by Replacing Library"
date = 2024-06-20T21:28:18+08:00
+++

I have a side project called "[comics](https://github.com/henry40408/comics)." It’s a simple HTTP server that serves comics so I can access them anywhere. According to the [Chrome documentation](https://web.dev/articles/browser-level-image-lazy-loading), to make images lazy-loaded, the server needs to run an initial scan and retrieve the dimensions of images when it starts. However, its performance is poor on my NAS, which uses HDD drives.

Initially, I used the [image-rs](https://github.com/image-rs/image) library, which I found widely recommended online.

After adding tracing to my code, I discovered that retrieving image dimensions during the initial scan took most of the time, which makes sense since it's the server's main task during this phase. However, I noticed the server's performance varies with the size of the images. Digging deeper, I found that the performance of image-rs degrades as image size increases. Here’s a code snippet that shows this issue:

```toml
# Cargo.toml
[package]
name = "a"
version = "0.1.0"
edition = "2021"

[dependencies]
image = { version = "0.25.1", default-features = false, features = ["jpeg"] }
```

```rust
// src/main.rs
use image::GenericImageView;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let image_path = args.get(1).expect("exepct file path");
    let img = image::open(image_path).expect("failed to open image");
    let (width, height) = img.dimensions();
    println!("{}x{}", width, height);
}
```

We can download sample images from Lorem Picsum using the following curl command:

```
curl -L https://picsum.photos/100/100 > 100.jpg
curl -L https://picsum.photos/1000/1000 > 1000.jpg
```

Then, benchmark image-rs with hyperfine:

```sh
$ cargo build --release # build the example with release profile
$ inxi -b # show my CPU
...
CPU:       Info: 6-Core AMD Ryzen 5 5600X [MT MCP] speed: 3693 MHz
...
$ hyperfine './target/release/a 100.jpg' './target/release/a 1000.jpg'
```

Here are the results:

| Command                       |      Mean [µs] | Min [µs] | Max [µs] |         Relative |
| :---------------------------- | -------------: | -------: | -------: | ---------------: |
| `./target/release/a 100.jpg`  |  518.7 ± 275.3 |    148.2 |   3543.7 |             1.00 |
| `./target/release/a 1000.jpg` | 6415.5 ± 485.1 |   5479.3 |   7775.7 | **12.37 ± 6.63** |

But I needed more proof, so I looked into the [source code](https://github.com/image-rs/image/blob/6edf8ae492c4bb1dacb41da88681ea74dab1bab3/src/codecs/jpeg/decoder.rs#L29-L35) of image-rs and found that it loads the entire image into memory to fetch the dimensions.

```rust
let mut r = r;
r.read_to_end(&mut input)?; // 👈
let mut decoder = zune_jpeg::JpegDecoder::new(input.as_slice());
decoder.decode_headers().map_err(ImageError::from_jpeg)?;
let (width, height) = decoder.dimensions().unwrap();
```

To be fair, image-rs is a feature-rich library, but it doesn't meet my performance expectations. So, I searched further and found an interesting topic on Stack Overflow:

[Get Image size WITHOUT loading image into memory](https://stackoverflow.com/a/19035508)

This led me to a Rust library called [imsz-rs](https://github.com/panzi/imsz). I ran a simple benchmark comparing image-rs and imsz, and the performance of imsz remained consistent even with larger images:

```toml
# Cargo.toml
[package]
name = "b"
version = "0.1.0"
edition = "2021"

[dependencies]
imsz = "0.3.1"
```

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let image_path = args.get(1).expect("exepct file path");
    let info = imsz::imsz_from_path(image_path).expect("failed to get dimensions");
    println!("{}x{}", info.width, info.height);
}

```

| Command                       |     Mean [µs] | Min [µs] | Max [µs] |    Relative |
| :---------------------------- | ------------: | -------: | -------: | ----------: |
| `./target/release/b 100.jpg`  | 504.7 ± 164.9 |    237.6 |   1584.8 |        1.00 |
| `./target/release/b 1000.jpg` | 515.3 ± 162.0 |    258.2 |   1381.0 | 1.02 ± 0.46 |

As the results show, imsz performs consistently regardless of the image size.

I tried to understand how imsz gets the dimensions of an image, but it looks like I need to know about the JPEG format. To me, it just seems like [looking for and reading specific bytes](https://github.com/panzi/imsz/blob/91b294c1388e37d1d55cfdda4a9d503578aef10e/src/lib.rs#L801-L831). All I can do is appreciate the maintainer's work.

Here are the results of benchmarking image-rs and imsz:

| Command                         | Mean [ms] | Min [ms] | Max [ms] |         Relative |
| :------------------------------ | --------: | -------: | -------: | ---------------: |
| `./a/target/release/a 1000.jpg` | 6.8 ± 0.5 |      5.9 |      9.1 | **14.08 ± 4.67** |
| `./b/target/release/b 1000.jpg` | 0.5 ± 0.2 |      0.2 |      1.2 |             1.00 |

As expected, imsz outperforms image-rs.

As the results show, no matter how big the image is, imsz performs consistently. Finally, I [replaced image-rs with imsz](https://github.com/henry40408/comics/pull/65) and saw a 56% performance improvement on my NAS.

## Conclusion

In conclusion, it's always rewarding to dig deeper to improve performance. By switching from image-rs to imsz, I achieved a significant performance boost. Exploring and understanding the underlying code can lead to substantial improvements.
