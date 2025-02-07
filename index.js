const NewBook = require("./models/books.model");
const Users = require("./models/user.model");
const { initialisation } = require("./db/db.connect");

initialisation();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
app.use(express.json());

const cors = require("cors");
const corsOptions = {
  origin: "https://pustaks.vercel.app",
  credentials: true,
  openSuccssStatus: 200,
};
app.use(cors(corsOptions));

app.get("/", (req, res) => res.send(`Express Server started`));

// Post Books.
app.post("/newBook", async (req, res) => {
  const bookToAdd = req.body;

  try {
    const addedBook = new NewBook(bookToAdd);
    const savedNewBook = await addedBook.save();

    if (savedNewBook) {
      res.status(201).json(bookToAdd);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Books.
app.get("/newBooks", async (req, res) => {
  try {
    const allBooks = await NewBook.find();

    if (allBooks) {
      res.status(201).json(allBooks);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get books by category
app.get("/newBooks/:newBookCategory", async (req, res) => {
  try {
    const newBookByCategory = await NewBook.find({
      category: req.params.newBookCategory,
    });

    if (newBookByCategory) {
      res.status(201).json(newBookByCategory);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get by categoryId
app.get("/newBooks/newBookCategory/:categoryId", async (req, res) => {
  try {
    const singleBookByCategory = await NewBook.find({
      _id: req.params.categoryId,
    });

    if (singleBookByCategory) {
      res.status(201).json(singleBookByCategory);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Book.
app.post(`/newBooks/:bookId`, async (req, res) => {
  const bookToUpdate = req.body;
  const bookId = req.params.bookId;

  try {
    const newBook = await NewBook.findByIdAndUpdate(bookId, bookToUpdate, {
      new: true,
    });

    if (!newBook) {
      res.status(401).json({ error: "Book not found" });
    }

    res.status(201).json(newBook);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete Book.
app.delete(`/newBooks/newBook/:bookId`, async (req, res) => {
  const bookId = req.params.bookId;

  try {
    const deletedBook = await NewBook.findByIdAndDelete(bookId);

    if (!deletedBook) {
      res.status(404).json({ error: "Book not found" });
    }

    res.status(201).json(deletedBook);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// add/increase book in cart
app.post(`/book/:userId/cart/:bookId`, async (req, res) => {
  const bookId = req.params.bookId;
  const userId = req.params.userId;

  try {
    const savedBook = await NewBook.findById(bookId);

    // checking if book present in the DB
    if (!savedBook)
      return res.status(404).json({ error: "Book id not correct" });

    // checking if user present in the DB
    const bookUser = await Users.findById(userId);

    if (!bookUser)
      return res.status(404).json({ error: "User id not correct" });

    // checking if book is already present in user's cartList or not
    const bookInCart = bookUser.cartList.find((data) =>
      data.bookId.equals(bookId)
    );

    let newBookData;

    if (bookInCart) {
      // If book is present then increase quantity.
      const newQuantity = bookInCart.quantity + 1;

      newBookData = await Users.findOneAndUpdate(
        { _id: userId, "cartList.bookId": bookId },
        {
          $set: { "cartList.$.quantity": newQuantity },
        },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "Quantity Increased", newBookData });
    } else {
      // Only add the book with quantiy equals to 1.
      newBookData = await Users.findByIdAndUpdate(
        userId,
        {
          $addToSet: { cartList: { bookId, quantity: 1 } },
        },
        { new: true }
      );

      return res.status(200).json({ message: "Book Added", newBookData });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// reduce book from cart
app.post(`/reduce/book/:userId/cart/:bookId`, async (req, res) => {
  const userId = req.params.userId;
  const bookId = req.params.bookId;

  try {
    const savedUser = await Users.findById(userId);
    if (!savedUser) return res.status(404).json({ message: "User not found" });

    const savedBook = await NewBook.findById(bookId);
    if (!savedBook) return res.status(404).json({ message: "Book not found" });

    const bookToUpdate = savedUser.cartList.find((data) =>
      data.bookId.equals(bookId)
    );

    let newBookData;

    if (bookToUpdate) {
      if (bookToUpdate.quantity > 1) {
        newBookData = await Users.findOneAndUpdate(
          {
            _id: userId,
            "cartList.bookId": bookId,
          },
          {
            $set: { "cartList.$.quantity": bookToUpdate.quantity - 1 },
          },
          { new: true }
        );

        return res
          .status(200)
          .json({ message: "Quantity decreased", newBookData });
      } else {
        newBookData = await Users.findByIdAndUpdate(
          userId,
          {
            $pull: { cartList: { bookId } },
          },
          { new: true }
        );

        return res.status(200).json({ message: "Book removed", newBookData });
      }
    } else {
      return res.status(404).json({ message: "Nothing to update" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// delete book in cart.
app.delete(`/removeBook/:userId/cart/:bookId`, async (req, res) => {
  const bookId = req.params.bookId;
  const userId = req.params.userId;

  try {
    const savedUser = await Users.findById(userId);
    if (!savedUser) return res.status(404).json({ message: "User not found" });

    const deletedBook = await Users.findByIdAndUpdate(
      userId,
      {
        $pull: { cartList: { bookId } },
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "User updated with new cart data", deletedBook });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get books from cart
app.get("/newbooks/user/cart", async (req, res) => {
  try {
    const allCartBooks = await Users.find()
      .select("cartList")
      .populate({ path: "cartList.bookId" });

    if (!allCartBooks) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(allCartBooks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// add book in wishlist
app.post(`/book/:userId/wishlist/:bookId`, async (req, res) => {
  const bookId = req.params.bookId;
  const userId = req.params.userId;

  try {
    const savedUser = await Users.findById(userId);
    if (!savedUser) return res.status(404).json({ message: "User not found" });

    const savedBook = await NewBook.findById(bookId);
    if (!savedBook) return res.status(404).json({ message: "Book not found" });

    const bookInWishlist = savedUser.wishList.find((book) =>
      book.bookId.equals(bookId)
    );
    let newBookInWishlist;

    if (bookInWishlist) {
      newBookInWishlist = await Users.findByIdAndUpdate(
        userId,
        {
          $pull: { wishList: { bookId } },
        },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "Book removed to wishlist", newBookInWishlist });
    } else {
      newBookInWishlist = await Users.findByIdAndUpdate(
        userId,
        {
          $addToSet: { wishList: { bookId } },
        },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "Book added to wishlist", newBookInWishlist });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// delete book from wishlist
app.delete(`/removeBook/:userId/wishlist/:bookId`, async (req, res) => {
  const bookId = req.params.bookId;
  const userId = req.params.userId;

  try {
    const savedUser = await Users.findById(userId);
    if (!savedUser) return res.status(404).json({ message: "User not found" });

    const bookInWishlist = savedUser.wishList.find((book) =>
      book.bookId.equals(bookId)
    );

    if (bookInWishlist) {
      const removedBook = await Users.findByIdAndUpdate(
        userId,
        {
          $pull: { wishList: { bookId } },
        },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "Book removed from wishlist", removedBook });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get book from wishlist
app.get(`/newbooks/user/wishlist`, async (req, res) => {
  try {
    const wishListData = await Users.find()
      .select({ path: "wishList" })
      .populate({ path: "wishList.bookId" });

    if (!wishListData)
      return res.status(404).json({ message: "No Books in wishlist" });

    res.status(200).json({ message: "Books found", wishListData });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

//order history routes in user model

// post book to order history.
app.post("/add/:bookId/order/history/:userId", async (req, res) => {
  const bookId = req.params.bookId;
  const userId = req.params.userId;
  const bookQuantity = req.body;

  try {
    const savedBook = await NewBook.findById(bookId);
    if (!savedBook) return res.status(404).json({ message: "book not found" });

    const savedUser = await Users.findById(userId);
    if (!savedUser) return res.status(404).json({ message: "user not found" });

    const newBookInOrder = await Users.findByIdAndUpdate(
      userId,
      {
        $push: { orderHistory: { bookId, quantity: bookQuantity.quantity } },
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Book ordered successfully", newBookInOrder });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// delete order
app.delete("/delete/:id/order/history/:userId", async (req, res) => {
  const id = req.params.id;
  const userId = req.params.userId;

  try {
    const savedUser = await Users.findById(userId);
    if (!savedUser) return res.status(404).json({ message: "user not found" });

    const deletedOrder = await Users.findByIdAndUpdate(
      userId,
      {
        $pull: { orderHistory: { _id: id } },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({ message: "Order got deleted", deletedOrder });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// get all orders
app.get("/get/all/orders", async (req, res) => {
  try {
    const allOrders = await Users.find()
      .select("orderHistory")
      .populate({ path: "bookId" });

    return res.status(200).json({ message: "All orders found", allOrders });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Address routes user model.
// add address routes

app.post("/add/address/:userId", async (req, res) => {
  const userId = req.params.userId;
  const addressData = req.body;

  try {
    const savedUser = await Users.findById(userId);
    if (!savedUser) return res.status(404).json({ message: "User not found" });

    const newAddress = await Users.findByIdAndUpdate(
      userId,
      {
        $push: { address: addressData },
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Address added successfully", newAddress });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// get address
app.get("/get/user/address/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const allAddress = await Users.findById(userId).select("address");

    if (!allAddress)
      return res.status(404).json({ message: "Addresses not found" });

    return res.status(200).json({ message: "All address", allAddress });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// edit address
app.post("/update/:userId/address/:addressId", async (req, res) => {
  const userId = req.params.userId;
  const addressId = req.params.addressId;
  const userData = req.body;

  try {
    const savedUser = await Users.findById(userId);
    if (!savedUser) return res.status(404).json({ message: "User not found" });

    const alreadyAddress = savedUser.address.some((address) =>
      address._id.equals(addressId)
    );

    let updatedAddress;

    if (alreadyAddress) {
      updatedAddress = await Users.findOneAndUpdate(
        { _id: userId, "address._id": addressId },
        {
          $set: { "address.$": { _id: addressId, ...userData } },
        },
        { new: true }
      );
    }

    return res.status(200).json({ message: "Address updated", updatedAddress });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// delete Address
app.delete("/delete/:userId/address/:addressId", async (req, res) => {
  const userId = req.params.userId;
  const addressId = req.params.addressId;

  try {
    const savedUser = await Users.findById(userId);
    if (!savedUser) return res.status(404).json({ message: "User not found" });

    const alreadyAddress = savedUser.address.some((address) =>
      address._id.equals(addressId)
    );

    let updatedAddressList;
    if (alreadyAddress) {
      updatedAddressList = await Users.findByIdAndUpdate(
        userId,
        {
          $pull: { address: { _id: addressId } },
        },
        { new: true }
      );
    }

    return res
      .status(200)
      .json({ message: "Address deleted", updatedAddressList });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Auth Routes
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const alreadyUser = await Users.findOne({ email });

    if (alreadyUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = new Users({ name, email, password });

    newUser.password = await bcrypt.hash(password, 10);
    const savedUser = await newUser.save();

    if (!savedUser)
      return res.status(404).json({ message: "User cannot get save" });

    return res.status(200).json({ message: "You got registered", savedUser });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

const verifyJwt = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ message: "No Token Provided" });

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const loginUser = await Users.findOne({ email });

    if (!loginUser)
      return res.status(401).json({ message: "Invalid credentials" });

    const passCheck = await bcrypt.compare(password, loginUser.password);

    if (!passCheck)
      return res.status(404).json({ message: "Invalid password" });

    const jwtToken = jwt.sign(
      {
        userId: loginUser._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    return res.status(200).json({
      message: "You logined successfully",
      jwtToken,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// private route
app.get("/profile/data", verifyJwt, (req, res) => {
  const loginedUser = req.user;

  return res.status(200).json({ message: "Profile data", loginedUser });
});

// single user route
app.get("/single/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const singleUser = await Users.findById(userId)
      .populate({
        path: "cartList",
        populate: {
          path: "bookId",
        },
      })
      .populate({ path: "wishList", populate: { path: "bookId" } })
      .populate({ path: "wishList", populate: { path: "bookId" } })
      .populate({ path: "orderHistory", populate: { path: "bookId" } })
      .populate({ path: "address", populate: { path: "bookId" } });

    if (!singleUser) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "User found", singleUser });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log("Server running at port", PORT));
