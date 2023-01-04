---
layout: default
title: Array vs Slice in Go
date: 2023-01-04
parent: Go
---

# Array vs Slice in Go

Go provides 2 structures for storing collection of items having the same type:

1. `array` - a fixed-sized collection
2. `slice` - a dynamically-sized collection that uses array under the hood to store its content

```go
// Initialize an each individual value to its zero value
var array1 [5]int
// Initialize an each element to a specific value
array2 := [3]int{1, 2, 3}
// Determine an array length based on on the number of values
array3 := [...]int{1, 2, 3, 4}
// Initialize just specific element to some value
array4 := [5]int{1: 3, 2: 4}
// Initialize a slice with 3 elements sets to their zero values
slice1 := make([]int, 3)
// Initialize with initial length of 3 that can expand to 5 elements without creating new internal array
slice2 := make([]int, 3, 5)
// Determine slice length from arguments
slice3 := []int{1, 2, 3}
```

## Sub-arrays and sub-slices

When array is created from a subset of other array, it shares internal elements

```go
array1 := [...]int{1, 2, 3, 4, 5}
array2 := array1[1:4] // [2, 3, 4]
array2[1] = 100 // both array1[2] and array2[1] equal to 100
```

Situation is similar with slices until one of them expand beyond its capacity:

```go
slice1 := []int{1, 2, 3, 4, 5}
slice2 := slice1[1:4] // 2, 3, 4
slice2[1] = 100 // both slice1[2] and slice2[1] equal to 100
slice1 = append(6) // create new internal array by expanding beyond initial capacity
slice2[1] = 200 // slice1[2] = 100, slice2[1] = 200
```

## Empty slice

To create an empty slice one of the following syntaxes can be used:

```go
// empty slice
var slice1 []
slice2 := make([], 0)
slice3 := []{}
// nil
var slice4 [] = nil
```

Empty slices and nils work with `append`, `lend`, etc.

## Passing to functions

When send to function as an argument:

- array is fully copied
- slice has metadata copied (length, capacity) with internal array being re-used (rules for sharing remain)

```go
func mutArray(array [3]int) {
	array[1] = 100
}

func mutSlice(slice []int) {
	slice[1] = 100
	slice = append(slice, 4)
}

array := [...]int{1, 2, 3}
mutArray(array) // stays as [1, 2, 3]

slice := []int{1, 2, 3}
mutSlice(slice) // changes to [1, 100, 3]
```
