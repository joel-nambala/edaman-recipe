'use strict';

// Select DOM elements
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

const recipeDOM = document.querySelector('.recipe');
const bookmarkDOM = document.querySelector('.bookmark-list');
const bookmarkUI = document.querySelector('.bookmarks');
const bookmarkRecipe = document.querySelector('.bookmark-recipe');

const copyYear = document.querySelector('.copy-year');

// API variables
const APP_KEY = '767a316f51f406e28759775035c693db';
const APP_ID = '166d8a58';
const API_URL = `https://api.edamam.com/api/recipes/v2`;

// State variables
let bookmarks = [];
let recipesData = [];
let boookmarking = true;

// Change the copyright year
const changeCopyYear = function () {
  const today = new Date().getFullYear();
  copyYear.textContent = today;
};
changeCopyYear();

const showBookmark = function () {
  bookmarkRecipe.style.transform = `translateX(${0})`;
};

const hideBookmark = function () {
  bookmarkRecipe.style.transform = `translateX(${105}%)`;
};

bookmarkUI.addEventListener('mouseenter', showBookmark);
bookmarkRecipe.addEventListener('mouseleave', hideBookmark);

const clearRecipeDOM = function () {
  recipeDOM.innerHTML = '';
};

const clearBookmarkDOM = function () {
  bookmarkDOM.innerHTML = '';
};

const displayRecipe = function (recipe) {
  const html = `
    <figure class="recipe-fig">
      <img src="${recipe.image}" alt="${recipe.label}" class="recipe-img" />
      <h3 class="recipe-name">
        <span class="recipe-name-span">${recipe.label}</span>
      </h3>
    </figure>
    <div class="recipe-info">
      <p class="info-text">
        <span class="info-calories">${recipe.calories.toFixed(
          2
        )}</span> calories
      </p>
      <p class="meal-type">${recipe.mealType}</p>
      <button class="info-bookmark" data-id="${recipe.uri}">Bookmark</button>
    </div>
    <div class="recipe-directions">
      <h3 class="recipe-ing">Recipe ingredients</h3>
      <ul class="recipe-list">
      ${recipe.ingredientLines
        .map(function (ing, i, arr) {
          return `<li class="recipe-item">
          <i class="fas fa-check recipe-icon"></i>${ing}
        </li>`;
        })
        .join('')}
      </ul>
    </div>
    <div class="how">
      <h3 class="how-direction">How to cook</h3>
      <p class="how-text">
        The recipe was designed and tested by
        <a href="${recipe.url}" target="_blank" class="how-link">${
    recipe.source
  }</a>.
        Please check out their website for more directions!
      </p>
      <a href="${
        recipe.url
      }" target="_blank" class="how-btn">Directions &rarr;</a>
    </div>
  `;

  recipeDOM.insertAdjacentHTML('beforeend', html);
};

const displayBookmarks = function (bookmarks) {
  bookmarks.forEach(function (bookmark, i, arr) {
    const html = `
    <li class="bookmark-item" data-id="${bookmark.uri}">
      <img src="${bookmark.image}" alt="${
      bookmark.label
    }" class="bookmark-img" />
      <div>
        <h3 class="bookmark-title">${
          bookmark.label.length < 34
            ? bookmark.label
            : bookmark.label.split('').slice(0, 34).join('') + '...'
        }</h3>
        <h4 class="bookmark-direction">${bookmark.source}</h4>
      </div>
    </li>
    `;

    bookmarkDOM.insertAdjacentHTML('beforeend', html);
  });
};

// Get the recipes
const getRecipes = async function (e) {
  clearRecipeDOM();
  e.preventDefault();
  // Get the search query
  const query = searchInput.value;

  if (!query) alert('Enter a valid search query!');

  try {
    // Request data from the api
    const result = await fetch(
      `${API_URL}?q=${query}&app_id=${APP_ID}&app_key=${APP_KEY}&type=public`
    );

    // Convert the data
    const data = await result.json();

    // Get the recipes
    const recipes = data.hits;

    const allRecipes = recipes.map(function (item) {
      return item.recipe;
    });

    recipesData = allRecipes;

    // Loop over the recipes array
    recipes.forEach(function (item, i, arr) {
      // Destructuring the recipe object
      const { recipe } = item;
      // console.log(recipe);

      displayRecipe(recipe);
    });
  } catch (error) {
    console.log(error);
  }

  let allButtons = [...document.querySelectorAll('.info-bookmark')];

  searchInput.value = '';
};

searchBtn.addEventListener('click', getRecipes);

recipeDOM.addEventListener('click', function (e) {
  if (e.target.classList.contains('info-bookmark')) {
    const id = e.target.dataset.id;
    const bookmarkedRecipe = recipesData.find(function (rec) {
      return rec.uri === id;
    });

    bookmarks.push(bookmarkedRecipe);
    e.target.textContent = 'bookmarked';
    e.target.disabled = true;
    boookmarking = false;

    // Update the bookmarks UI
    clearBookmarkDOM();
    displayBookmarks(bookmarks);
  }
});

bookmarkDOM.addEventListener('click', function (e) {
  const bookmarkItem = e.target.closest('.bookmark-item');
  if (bookmarkItem) {
    clearRecipeDOM();
    const id = bookmarkItem.dataset.id;
    const recipe = bookmarks.find(function (rec, i, arr) {
      return rec.uri === id;
    });

    hideBookmark();
    displayRecipe(recipe);
  }
});

window.addEventListener('load', function (e) {
  if (!localStorage.getItem('edaman')) return;

  bookmarks = JSON.parse(localStorage.getItem('edaman'));

  if (bookmarks.length < 0) return;
  clearBookmarkDOM();
  displayBookmarks(bookmarks);
});
