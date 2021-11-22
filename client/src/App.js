import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import "./App.css";

import Home from "./components/Home";
import AddPrompt from "./components/AddPrompt";
import AddUser from "./components/AddUser";
import UserAuthentication from "./components/UserAuthentication";
import AddCategory from "./components/AddCategory";
import Header from "./components/Header";
import Categories from "./components/Categories";
import Category from "./components/Category";
import Profile from "./components/Profile";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"))
  const [userCategories, setUserCategories] = useState([]);
  const [userPrompts, setUserPrompts] = useState([]);


  useEffect(() => {
    getUserCategories()
    getFilteredPromptsByCategory()
  }, []);


  function onSuccess(boolean) {
    setIsAuth(boolean)
  }

  const getUserCategories = async () => {
    try {
      const response = await fetch("/categories/users", {
        headers: {
          authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      const userCategories = await response.json();
      if (!userCategories.message) {
        setUserCategories(userCategories);
      }
    } catch (err) {
      console.log(err);
    }
  }

  const getFilteredPromptsByCategory = (categoryId) => {
    let queryString = ""
    if (categoryId) queryString = `/?categories[]=${categoryId}`

    fetch(`/prompts/users${queryString}`, {
      headers: {
        authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((response) => response.json())
      .then((prompts) => {
        setUserPrompts(prompts)
      })
      .catch((error) => {
        console.log(error);
      });
  };

  function addUserCategory(userCategory) {
    setUserCategories((state) => ([...state, userCategory]))
  }


  return (
    <div id="wrapper">
      <BrowserRouter>
        <Header onSuccess={onSuccess} isAuth={isAuth} setUserCategories={setUserCategories} />
        <Routes>
          <Route path="/authentication" element={<UserAuthentication onSuccess={onSuccess} getUserCategories={getUserCategories} />} />
          <Route path="/register" element={<AddUser />} />
          <Route path="/"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <Home userCategories={userCategories} userPrompts={userPrompts} setUserPrompts={setUserPrompts} getFilteredPromptsByCategory={getFilteredPromptsByCategory} />
              </ProtectedRoute>
            }
          />
          <Route path="/add"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <AddPrompt userCategories={userCategories} setUserPrompts={setUserPrompts} />
              </ProtectedRoute>
            }
          />
          <Route path="/categories"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <Categories userCategories={userCategories} />
              </ProtectedRoute>
            }
          >
            <Route path="add" element={<AddCategory addUserCategory={addUserCategory} />} />
            <Route path=":id" element={<Category getUserCategories={getUserCategories} />} />
          </Route>
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;



