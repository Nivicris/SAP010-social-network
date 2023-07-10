import './feed.css';
import { authStateChanged } from '../lib/index';
import {
  dislike,
  getFeedItems,
  like,
  publish,
  editItem,
  deletePost,
} from '../lib/firestore';

export const feedUser = () => {
  const container = document.createElement('div');
  const template = `
  <header>
    <nav>
      <div class="navbar">
        <div class="container nav-container">
          <input class="checkbox" type="checkbox" name="" id="" />
          <div class="hamburger-lines">
            <span class="line line1"></span>
            <span class="line line2"></span>
            <span class="line line3"></span>
          </div>
          <div class="nameHeader">
            <h1>Food Review</h1>
          </div>
          <div class="menu-items">
            <li><a href="#feed">Feed</a></li>
            <li><a href="#sobre">Sobre</a></li>
            <li><a href="#sair">Sair</a></li>
          </div>
        </div>
      </div>
    </nav>
  </header>
  <main>
      <nav class="nav__cont">
        <ul class="nav">
          <li class="nav__items"><a href="#feed"><img src="Img/home-feed.svg"/>Feed</a></li>
          <li class="nav__items"><a href="#sobre"><img src="Img/info-feed.svg"/>Sobre</a></li>
          <li class="nav__items"><a href="#sair"><img src="Img/logout-feed.svg"/>Sair</a></li>
        </ul>
      </nav>
    <section class="feed">
      <img class='imgFeed'src="Img/bg-feed.png"/>
      <div class="boxExperience">
        <button id="experienceButton" class="experience-button">Qual experiência você teve hoje?</button>
      </div>
      <div id="postList"class="post-list"> 
        
      </div>
    </section>
 </main>
  <div id="createPost" class="post">
    <div class="post-content">
      <span id= "close" class="close">&times;</span>
      <div class='photo'>
        <img referrerpolicy='no-referrer' class='profilePicture' id="userPhoto" src="" alt="Foto do perfil">
        <span class='profileName' id="userName"></span>
      </div>
      <input id="userId" type="hidden"/>
      <form id="postForm" class='formPost'>
      <input id="postPublishId" type="hidden"/>
        <textarea class='inputContent' id="postContent" placeholder="Qual experiência você teve hoje?" required></textarea>
        <div class="form-bottom">
          <img class='img-location' src="Img/location-feed.svg">
          <textarea class='inputLocation' type="text" id="postLocation" placeholder="Restaurante"required></textarea>
          <button type='button' class='buttonPublish' id="publishButton" onclick="publishPost()">Publicar</button>
        </div>
        <p id='messageContainer'></p>
      </form>
    </div>
  </div>
  `;

  container.innerHTML = template;
  const modal = container.querySelector('#createPost');
  const closeButton = container.querySelector('#close');
  const openPublishButton = container.querySelector('#experienceButton');

  function openModal() {
    modal.style.display = 'block';
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  openPublishButton.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  authStateChanged((user) => {
    if (user) {
      const userNameElement = document.getElementById('userName');
      const userIdElement = document.getElementById('userId');
      const userPhotoElement = document.getElementById('userPhoto');
      const userPhotoAvatar = 'Img/Usuario.png';
      userNameElement.textContent = user.displayName;
      userIdElement.value = user.uid;
      if (user.photoURL) {
        userPhotoElement.src = user.photoURL;
      } else {
        userPhotoElement.src = userPhotoAvatar;
      }
    }
  });

  const renderCards = (items) => {
    const card = ({
      description,
      likes,
      restaurantName,
      userAvatar,
      userName,
      userId,
      id,
    }) => {
      const myUserId = document.getElementById('userId').value;
      const liked = likes.find((item) => item.userId === myUserId) != null;

      return (
        `<div class="card">
          <div class="card-header">
            <div class="card-user">
              <div class="card-avatar"> <img referrerpolicy='no-referrer' src="${userAvatar}"/></div>
              <div>
              <h5>${userName}</h5>
              </div>
            </div>
            ${userId === myUserId ? `<div class='card-actions'>
                <img class="points-feed" id='editPostButton' src="Img/pen.png" onclick="editPostUser('${id}', '${description}', '${restaurantName}')" alt='Lapis ilustrativo'/>
                <img class="points-feed" onclick='postDelete("${id}")' src='Img/bin.png' alt='Lixo ilustrativo'/>
              </div>` : ''}
          </div>
          <div class="card-description">
            <p>${description}</p>
          </div>
          <div class="card-info">
            <div class="card-likes">
              <img src="${liked ? 'Img/heart-feed-total.svg' : 'Img/heart-feed.svg'}" onclick="likePost('${id}', ${liked})" />
              ${likes.length}
            </div>
            <div class="card-restaurant"> <img class="img-location-feed" src="Img/location-feed.svg"/> ${restaurantName}</div>
          </div>
        </div>`
      );
    };
    const postList = document.querySelector('#postList');
    postList.innerHTML = items.map(card).join('');
  };

  getFeedItems(renderCards);
  return container;
};

async function publishPost() {
  const userNameElement = document.getElementById('userName');
  const userPhotoElement = document.getElementById('userPhoto');
  const postLocation = document.getElementById('postLocation');
  const postContent = document.getElementById('postContent');
  const userId = document.getElementById('userId');
  const postId = document.getElementById('postPublishId');
  const messageContainer = document.getElementById('messageContainer');

  if (postContent.value.trim() === '' || postLocation.value.trim() === '') {
    messageContainer.textContent = 'Gostariamos de saber a sua experiência, não se esqueça de preencher todos os campos!';
    return;
  }

  const post = {
    description: postContent.value,
    rating: 2,
    restaurantName: postLocation.value,
    userAvatar: userPhotoElement.src,
    userName: userNameElement.textContent,
    createdAt: new Date(),
    userId: userId.value,
  };
  if (postId.value === '') {
    await publish(post);
  } else {
    await editItem(postId.value, post);
    postId.value = '';
    window.alert('Postagem editada com sucesso!');
  }
  const closeButton = document.querySelector('#close');
  closeButton.click();
  const form = document.querySelector('#postForm');
  form.reset();
}
window.publishPost = publishPost;

async function likePost(postId, liked) {
  const userId = document.getElementById('userId').value;

  if (liked) {
    await dislike(postId, userId);
  } else {
    await like(postId, userId);
  }
}
window.likePost = likePost;

async function editPostUser(id, description, restaurantName) {
  const openPublishButton = document.querySelector('#experienceButton');
  const postLocation = document.getElementById('postLocation');
  const postContent = document.getElementById('postContent');
  const postId = document.getElementById('postPublishId');
  postContent.value = description;
  postLocation.value = restaurantName;
  postId.value = id;
  openPublishButton.click();
}
window.editPostUser = editPostUser;

async function postDelete(id) {
  if (window.confirm('Deseja mesmo excluir esse post?')) {
    await deletePost(id);
  }
}
window.postDelete = postDelete;
