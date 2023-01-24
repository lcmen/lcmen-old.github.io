---
layout: default
title: Declaring flags with iota in Go
date: 2023-01-24
parent: Go
---

# Declaring flags with iota in Go

Go provides `iota` keyword which is helpful for defining block of constants:

```golang
const (
	Ldate = 1 << iota
	Ltime
	Llongfile
	Lshortfile
)
```

It instructs compiler to duplicate the expression for each following line until the block ends or an assignment is found. It also increases the `iota` value by 1 for each line.

The example above results in following constants:

```golang
const (
	Ldate = 1 << iota // 1 << 0 = 00000001 = 1
	Ltime             // 1 << 1 = 00000010 = 2
	Llongfile         // 1 << 2 = 00000100 = 4
	Lshortfile        // 1 << 3 = 00001000 = 8
)
```

The `<<` operator performs a left bitwise shift operation with bits from the value on the left side of the operator.

In a case above, we're moving `1` left giving each constant a unique value so that they can be safely combined using bitwise or operator (`|`).

```golang
const Ldefault = Ldate | Ltime | Lshortfile // 00001011 = 11
```
