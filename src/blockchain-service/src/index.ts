import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import authRoutes from "./../routes/blockchain-service";
import "./config/passport";

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!, {});

// Middleware
app.use(express.json());
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use('/api/balance', authRoutes);

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI!, {})
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
    });
}).catch((err: any) => console.error(err));

/*
    auth micro-service for service
*/ 