---
title: TensorFlow Reference
description: Self-explanatory. I'll add the places I used here d2l.ai
date: "2022-06-13"
tags: [jupyter, python, tensorflow]
---


```python
import tensorflow as tf
```

# Creating a tensor

You should always assign the `dtype` when creating a tensor.


```python
x = tf.range(start=12, dtype=tf.float32)
```

## Tensor Attributes

### Tensor Shape


```python
x.shape
```




    TensorShape([12])




```python
tf.size(x)
```




    <tf.Tensor: shape=(), dtype=int32, numpy=12>



### Tensor Data Type


```python
x.dtype
```




    tf.float32



## Changing a Tensor

Use `tf.reshape`

- Will accept the tensor, and the shape, with the shape in the form of: `(# of rows, # of columns)`
- If you know all but one of the dimensions, you can leave the unknown dimension as `-1`: `(# of rows, -1)`


```python
print(x)
```

    tf.Tensor([ 0.  1.  2.  3.  4.  5.  6.  7.  8.  9. 10. 11.], shape=(12,), dtype=float32)


Here I'm explcitly defining the reshaping as (3,4)


```python
print(tf.reshape(x, shape=(3, 4)))
```

    tf.Tensor(
    [[ 0.  1.  2.  3.]
     [ 4.  5.  6.  7.]
     [ 8.  9. 10. 11.]], shape=(3, 4), dtype=float32)


Here I left the column number blank, and it filled in automatically:


```python
print(tf.reshape(x, shape=(3, -1)))
```

    tf.Tensor(
    [[ 0.  1.  2.  3.]
     [ 4.  5.  6.  7.]
     [ 8.  9. 10. 11.]], shape=(3, 4), dtype=float32)


## Ones, Random, Constant Tensor


```python
print(tf.ones(shape=(3, 4)))
```

    tf.Tensor(
    [[1. 1. 1. 1.]
     [1. 1. 1. 1.]
     [1. 1. 1. 1.]], shape=(3, 4), dtype=float32)


Keep in mind you can change a lot of parameters w.r.t. $\mu, \sigma, $ etc. since this is a random normal distribution. There are more distributions as well if need be.


```python
print(tf.random.normal(shape=(3, 4)))
```

    tf.Tensor(
    [[ 2.202327   -0.26792583 -0.74406874 -0.6372847 ]
     [ 0.46985132 -0.3888988   0.47005928  0.08380948]
     [-0.6244405   0.47245353 -1.8344202  -1.2178894 ]], shape=(3, 4), dtype=float32)



```python
print(tf.constant([[1, 2, 3], [4, 5, 6]]))
```

    tf.Tensor(
    [[1 2 3]
     [4 5 6]], shape=(2, 3), dtype=int32)


# Tensor Operations

These operations are performed *__elementwise__*:
- Addition
- Subtraction
- Multiplication
- Division
- Exponentiation

Definition of elementwise in this context:

Given vectors $x$ and $y$, an elementwise operation (for example addition) will be performed between each corresponding element in the given vectors: 

If:

- $\bar{x} := [x_1, \dots , x_n]$
- $\bar{y} := [y_1, \dots, y_n]$ 

then:

$$
\begin{aligned}
\bar{x} + \bar{y} &= \begin{bmatrix}
            x_1 + y_1 \\ 
            x_2 + y_2 \\
            \vdots \\
            x_n + y_n
\end{bmatrix}
\end{aligned}
$$

Example:


```python
x = tf.constant([1, 2, 4, 8])
y = tf.constant([2, 2, 2, 2])
```

Addition:


```python
print(x + y)
```

    tf.Tensor([ 3  4  6 10], shape=(4,), dtype=int32)


Subtraction


```python
print(x - y)
```

    tf.Tensor([-1  0  2  6], shape=(4,), dtype=int32)


Multiplication


```python
print(x * y)
```

    tf.Tensor([ 2  4  8 16], shape=(4,), dtype=int32)


Division


```python
print(x / y)
```

    tf.Tensor([0.5 1.  2.  4. ], shape=(4,), dtype=float64)


Exponentiation


```python
print(x ** y)
```

    tf.Tensor([ 1  4 16 64], shape=(4,), dtype=int32)


## Dot Product

If:

- $\bar{x} := [x_1, \dots , x_n]$
- $\bar{y} := [y_1, \dots, y_n]$ 

Then the dot product ($\bullet$) is defined:

$$
\bar{x} \bullet \bar{y} = \sum_{i=1}^{n} x_i \cdot y_i
$$


```python
tf.tensordot(tf.constant([1, 2, 3]), tf.constant([8, 8, 8]), axes=1)
```




    <tf.Tensor: shape=(), dtype=int32, numpy=48>



## Broadcasting

Look at the explanation [NumPy provides](https://numpy.org/doc/stable/user/basics.broadcasting.html)


```python
x = tf.reshape(tf.range(start=12), shape=(3, 4))
y = tf.range(start=4)

print("================= Matrix of shape 3x4 =================")
print(x.numpy(), "\n")
print("================= Vector of shape 1x3 =================")
print(y.numpy())

print("================== Sum of shape 3x4 ===================")
print(tf.math.add(x, y).numpy())
```

    ================= Matrix of shape 3x4 =================
    [[ 0  1  2  3]
     [ 4  5  6  7]
     [ 8  9 10 11]] 
    
    ================= Vector of shape 1x3 =================
    [0 1 2 3]
    ================== Sum of shape 3x4 ===================
    [[ 0  2  4  6]
     [ 4  6  8 10]
     [ 8 10 12 14]]



```python

```
