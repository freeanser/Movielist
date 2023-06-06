// API網址
const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/"; // + id => 顯示跳出的卡片
const POSTER_URL = BASE_URL + "/posters/";

const FRIENDS_PER_PAGE = 12;
const userContainer = document.querySelector("#user-container"); // 新卡片的容器
const oneCard = document.querySelector(".one-card");
const oneList = document.querySelector(".one-list");
// 找出所有 showMoreInfo 需要更改資料的節點
const modalTitle = document.querySelector(".modal-title");
const modalImage = document.querySelector(".modal-image");
const modalInfo = document.querySelector(".modal-info");
// search bar
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
// pagination
const pagination = document.querySelector(".pagination");
// change-cards-list
const changeCardsList = document.querySelector(".change-cards-list");
// 切換頁面時，會一起改變的變數
let currentMode = "cards";

// 用 axios 請求將資料放入 (調用function: renderFriends)
// 記得把這個也包在一個function裡面，就可以重複使用
let friendsList = []; //新卡片插入的位置
let filterFriends = [];

// 設定一個可以將頁數帶著走的變數
let currentPage = 1;

function renderFriendsList() {
  // 用API製作我們需要的 user 清單 陣列
  axios.get(INDEX_URL).then((response) => {
    // friendsList = response.data.results
    friendsList.push(...response.data.results); //把需要的資料拿出來 //用push是預設未來可能前方有其他資料
    renderFriendsByCards(sliceFriendsByPage(1)); // function: 製作出每一張卡片 // 先把預設值放好
    renderPagination(friendsList.length); // 在這裡呼叫，因為這裡的 friendsList 是最完整的
  });
}

// function: 存入新資料，製作新的card (render cards)
function renderFriendsByCards(data) {
  let rawHtml = "";
  // 把陣列中的每一個item 提取出來，放入rawHtml
  data.forEach((item) => {
    rawHtml += `
    <div class="one-card" data-mode = "cards-mode">
      <img src=${POSTER_URL}${item.image} class="card-img-top" alt="card ${item.id}">
      <h5 class="card-text">${item.title} </h5>
      <div class="card-body">
        <button type="button" data-bs-toggle="modal" data-bs-target="#exampleModal" class="btn btn-primary btn-show-more-info" data-modal-user-id="${item.id}" id="1">More</button>
        <button type="button" class="btn btn-success btn-add-favorite" data-modal-user-id="${item.id}" > + </button>
      </div>
    </div>
    `;
  });
  // 把 rawHtml 放入想要卡片產生的地方
  // console.log('render',rawHtml.length)
  userContainer.innerHTML = rawHtml;
}

function renderFriendsByList(data) {
  let rawHtml = ``;
  // 把陣列中的每一個item 提取出來，放入rawHtml
  data.forEach((item) => {
    rawHtml += `
      <div class="one-list data-mode = "list-mode" >
      <div class="list-name"> <h5 >${item.title} </h5> </div>
      <div class="list-body">
        <button type="button" data-bs-toggle="modal" data-bs-target="#exampleModal" class="btn btn-primary btn-show-more-info" data-modal-user-id="${item.id}" id="1">More</button>
        <button type="button" class="btn btn-success btn-add-favorite" data-modal-user-id="${item.id}" > + </button>
      </div>
    </div>
    `;
  });
  // 把 rawHtml 放入想要卡片產生的地方
  // console.log('render',rawHtml.length)
  userContainer.innerHTML = rawHtml;
}

function onCangeCardsListClicked() {
  if (event.target.matches(".fa-th")) {
    currentMode = "cards";
    renderFriendsByCards(sliceFriendsByPage(currentPage));
  } else if (event.target.matches(".fa-bars")) {
    currentMode = "list";
    renderFriendsByList(sliceFriendsByPage(currentPage));
  }
}

// 產出每一筆的show資料 (from Modal), 結合被點擊者的 id
function onPanelClicked(event) {
  // 找到對應的 id
  const id = Number(event.target.dataset.modalUserId);
  if (!id) {
    return;
  }
  if (event.target.matches(".btn-show-more-info")) {
    showMoreFriendsInfo(id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(id);
  }
}

function showMoreFriendsInfo(id) {
  // 先清空，防止上一張殘留
  modalTitle.textContent = "";
  modalImage.textContent = "";
  modalInfo.textContent = "";
  // 用 axios 請求將 show 資料放入 (需放在 function 裡，因為 id 要由 function 產出 )
  axios.get(INDEX_URL + id).then((response) => {
    // 用API製作我們需要的 user 清單 陣列

    const data = response.data.results;
    console.log(data);
    modalTitle.textContent = `${data.title} `;
    modalImage.src = POSTER_URL + data.image;
    modalInfo.innerHTML = `
    <p><em>Release Date: ${data.release_date}</em></p>
    <p>Description: ${data.description}</p>
    `;
  });
}

//addToFavorite
function addToFavorite(id) {
  // 可以在 function 裡面宣告 favoriteList，因為最後會用 setItem存到 全視領域
  const favoriteList =
    JSON.parse(localStorage.getItem("Favorite Friends: ")) || [];
  // 檢查 favoriteList 中是否已經有 被點擊的物件
  if (favoriteList.some((friend) => friend.id === id)) {
    return alert("此電影已經在收藏絕佳電影清單中！");
  }
  const favoriteFriend = friendsList.find((friend) => friend.id === id);
  favoriteList.push(favoriteFriend);
  console.log(favoriteList);
  localStorage.setItem("Favorite Friends: ", JSON.stringify(favoriteList));
}

// search form 的 function
function onSearchFormSubmitted(event) {
  // console.log('search', event)
  event.preventDefault(); // 預防瀏覽器將頁面重整
  const keywords = searchInput.value.trim().toLowerCase();
  // 排除空字串
  if (!keywords.length) {
    return alert("請輸入有效字串");
  }
  // 設定filter
  // 要檢查的物件.filter(用來檢查的函式) = 篩選後的資料陣列
  filterFriends = friendsList.filter((user) =>
    user.title.toLowerCase().includes(keywords)
  );
  // console.log('filterFriends', filterFriends)
  // 產出新卡片
  renderFriendsByCards(sliceFriendsByPage(1));
  // 產出新的 pagination
  renderPagination(filterFriends.length);
}

// pagination  // 共幾頁  // amount => friendsList.length
function renderPagination(amount) {
  const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE); // 17頁
  // 產出 17組  data-page-id="${}"
  let rawHtml = ``;
  for (let page = 1; page <= numberOfPages; page++) {
    rawHtml += `
  <li class="page-item"><a class="page-link" data-page-id="${page}" href="#"> ${page}</a></li>
  `;
  }
  pagination.innerHTML = rawHtml;
}

// 1. 分頁 2. 分頁產出卡片 => 結合 function: renderFriendsByCards
// page 1 ->  0 - 11 => slice 切點為 0 和 12  // page 2 -> 12 - 23 => slice 切點為 2 和 23
function sliceFriendsByPage(page) {
  // !!! 不需要重複切 ！！！  // 使用者點開哪一頁，再渲染出那頁就好  // 不用 for ！！！！
  // 現在要把清單切割，但是要被切割的 friends 是誰? filterFriends : friendsList
  //如果filterFriends有長度，就把filterFriends優先切。如果filterFriends沒有長度，就把friendsList 切割
  const data = filterFriends.length ? filterFriends : friendsList;
  const startIndex = (page - 1) * 12;
  const endIndex = startIndex + FRIENDS_PER_PAGE;
  // 依照使用者點開的頁面，return出我們要的朋友資料
  return data.slice(startIndex, endIndex);
}

// 1. 找出使用者到底按哪一頁？
// 2. 渲染出使用者按的那一頁 function: sliceFriendsByPage(pageId) => renderFriendsByCards(sliceFriendsByPage(pageId))
function onPaginatorClicked(event) {
  const pageId = Number(event.target.dataset.pageId);
  // if (!pageId || pageId <= 0) { return }
  if (event.target.tagName !== "A") {
    return;
  }
  currentPage = pageId;

  // console.log(oneCard)
  // console.log(oneList)
  if (currentMode === "cards") {
    renderFriendsByCards(sliceFriendsByPage(currentPage));
  } else if (currentMode === "list") {
    renderFriendsByList(sliceFriendsByPage(currentPage));
  }

  console.log(currentPage);
}

// 點擊事件
userContainer.addEventListener("click", onPanelClicked);
searchForm.addEventListener("submit", onSearchFormSubmitted);
pagination.addEventListener("click", onPaginatorClicked);
changeCardsList.addEventListener("click", onCangeCardsListClicked);

renderFriendsList();
