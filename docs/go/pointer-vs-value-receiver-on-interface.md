---
layout: default
title: Pointer vs Value receiver on Go interface
date: 2023-01-09
parent: Go
---

# Pointer vs value receiver on Go interface

Golang provides a mechanism to auto box / unbox between value and reference types on receiver methods to improve developer's experience:

```golang
type notifier interface {
  notify()
}

type email struct {}
type sms struct {}

func (e email) notify() {}
func (s *sms) notify() {}

func main() {
  e1 := email{}
  e2 := &email{}
  s1 := sms{}
  s2 := &sms{}

  e1.notify()
  e2.notify()
  s1.notify()
  s2.notify()
}
```

However when interfaces are involved, this mechanism does not work the same way:

```golang
func notify(n notifier) {
  n.notify()
}

func main() {
  e1 := email{}
  e2 := &email{}
  s1 := sms{}
  s2 := &sms{}
  notify(e1)
  notify(e2)
  notify(s1) // cannot use s1 (variable of type sms) as type notifier in argument to notify:
             // sms does not implement notifier (notify method has pointer receiver)
  notify(s2)
}
```

This error is caused by methods set rules on interface in Golang's specification.

## Interface internal structure

To better understand the rules behind interface methods, let's take a look how interfaces are implemented under the hood.

Interface is a two-words data structure containing:

1. Pointer to internal `iTable` containing information about typed stored in the interface and methods associated with that type
2. Pointer to stored value or address (if interface holds pointer to a value)

Methods set define a following rules around type compliance:

| Receiver in method signature | Supported values for caller |
|------------------------------|-----------------------------|
| T                            | (t T) and (t T*)            |
| T*                           | (t T*)                      |

In example above, `notify` method for `sms` type was using a pointer as a method receiver:

```golang
func (s *sms) notify() {}
```

According to rules defined above, such method will accept only the interfaces that hold a reference to `sms` value. Since `s1` variable was a value of `sms` type, the program didn't compile:

```golang
s1 := sms{}
```

This limitation is caused by the fact that is not always possible to get address a value:

```golang
func main() {
  s := &sms{}
  s.notify()
  sms{}.notify() // cannot call pointer method notify on sms
                 // cannot take the address of sms{}
  &sms{}.notify() // won't work either
}
```

As we can see, Go can't take address of `sms` structure until it's assigned to a variable.

Actually the specification of the language, strictly defines which operands are addressable:

- variable
- array indexing operation
- slice indexing operation
- field of addressable struct

Composite literals are exception to these rules but only when they are used to create variables (`s2 := &sms{}`). When they are used to directly call methods on literals (as we saw above with `&sms{}.notify()`) they are not addressable.
