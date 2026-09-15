// const toggleBtn = document.getElementById('dropdownToggle');
// const menu = document.getElementById('dropdownMenu');

// toggleBtn.addEventListener('click', () => {
//   menu.classList.toggle('hidden');
// });

document.addEventListener('DOMContentLoaded', function () {
  const groundsContainer = document.getElementById('grounds-container');
  const loadingIndicator = document.getElementById('loading-indicator');
  const noGroundsMessage = document.getElementById('no-grounds-message');

  function createGroundCard(ground) {
      const card = document.createElement('div');
      card.className = 'boxcontent w-[30%] bg-white m-5 shadow-2xl rounded-xl text-center flex flex-col items-center justify-center';

      const nameHeading = document.createElement('h2');
      nameHeading.className = 'font-sigmar text-3xl mt-1 bg-gradient-to-r from-blue-600 to-green-500 inline-block text-transparent bg-clip-text';
      nameHeading.textContent = ground.name || 'Unnamed Ground';

      const imgContainer = document.createElement('div');
      imgContainer.className = 'box-img p-2';

      const img = document.createElement('img');
      img.src = ground.ground_picture || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image';
      img.alt = `Image of ${ground.name || 'ground'}`;
      img.className = 'rounded-md border-2 border-solid border-black';
      img.onerror = function () {
          this.onerror = null;
          this.src = 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Image+Error';
      };
      imgContainer.appendChild(img);

      const bookButton = document.createElement('button');
      bookButton.type = 'button';
      bookButton.className = 'book-now-button mt-auto text-white bg-gradient-to-br from-[#013220] to-[#39ff14] hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2';
      bookButton.textContent = 'Book Now!';
      bookButton.dataset.groundId = ground.ground_id;
      bookButton.dataset.groundName = ground.name || 'Unnamed Ground';
      bookButton.dataset.groundPicture = ground.ground_picture || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image';
      bookButton.addEventListener('click', handleBookingClick);

      card.appendChild(nameHeading);
      card.appendChild(imgContainer);
      card.appendChild(bookButton);

      return card;
  }

  // Fetch grounds from backend
  fetch('src/backend/display_grounds.php')
      .then(response => response.json())
      .then(data => {
          loadingIndicator.style.display = 'none';

          if (data.error) {
              console.error('Error:', data.error);
              noGroundsMessage.classList.remove('hidden');
              return;
          }

          if (data.length === 0) {
              noGroundsMessage.classList.remove('hidden');
              return;
          }

          data.forEach(ground => {
              const card = createGroundCard(ground);
              groundsContainer.appendChild(card);
          });
      })
      .catch(error => {
          console.error('Fetch error:', error);
          loadingIndicator.style.display = 'none';
          noGroundsMessage.classList.remove('hidden');
      });
});

function handleBookingClick(event) {
  const button = event.currentTarget;
  const groundId = button.dataset.groundId;
  const groundName = button.dataset.groundName;
  const groundPic = button.dataset.groundPicture;

  console.log(`Book Now clicked for ground ID: ${groundId}`);

  window.location.href = '/Futsal Booking App/booking.html?groundId=' + encodeURIComponent(groundId) +
                         '&groundName=' + encodeURIComponent(groundName) + '&groundPicture=' + encodeURIComponent(groundPic);

}