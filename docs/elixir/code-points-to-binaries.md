---
layout: default
title: Code points to binaries in Elixir
date: 2022-01-04
parent: Elixir
---

# Code points to binaries in Elixir

A code point is a numerical representation of a character in the Unicode Standard. Elixir uses UTF-8 to encode strings and binaries.

For example, code point for letter `ę` equals to `281`:

```
iex(1)> ?ę
281
```

Here is how UTF-8 encoding serializes numbers on multiple bytes:

| Length      | First byte | Following bytes |
|=============|============|=================|
| Single byte | 0XXXXXXX   | N/A             |
| Two bytes   | 110XXXXX   | 10XXXXXX        |
| Three bytes | 1110XXXX   | 10XXXXXX        |
| Four bytes  | 11110XXX   | 10XXXXXX        |

Our `281` code point requires 2 bytes for representation in UTF-8 encoding (a single UTF-8 byte can encode numbers from 0 to 127 only).

If we convert `281` straight to a binary, we will receive `100011001`. Placing this sequence of 1/0 on placeholders for two-bytes length from the table above gives the following bytes: `11000100 11011001`. In the base-10 system, they are represented as `196` and `153` which are our binaries:

```
iex(2)> "ę" <> <<0>>
<<196, 153, 0>>
iex(3)> "foo" <> <<0>>
<<102, 111, 111, 0>>
```

*Concatenating a string with with the null byte `<<0>>` returns its inner binary representation.*
