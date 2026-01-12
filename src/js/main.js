document.addEventListener('DOMContentLoaded', () => {
    fetch('src/backend/check_session.php')
      .then(res => res.json())
      .then(data => {
        const signInArea = document.getElementById('signInArea');
        const yourGroundLink = document.getElementById('yourGroundLink');
  
        if (data.logged_in) {
          // Show welcome message
          signInArea.innerHTML = `Welcome, ${data.username}! 
            &nbsp; <a href="#" class="hover:text-[#DF6D14] font-semibold" id="logoutBtn">Logout</a>`;
  
          // Show "Your Ground" link only if role is ground_owner
          if (data.role === 'ground_owner') {
            yourGroundLink.classList.remove('hidden');
          }
          document.getElementById('logoutBtn').addEventListener('click', e => {
            e.preventDefault();
            fetch('src/backend/logout.php')
              .then(() => window.location.href = 'index.html')
              .catch(err => console.error('Logout failed:', err));
          });
        } else {
          // Show login dropdown
          signInArea.innerHTML = `
            <a id="dropdownbtn" class="flex items-center hover:text-gray-200 cursor-pointer w-8 h-8 ">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hover:text-gray-200" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </a>
            <div id="dropdownmenu" class="absolute bg-black font-bold shadow-lg rounded-md mt-1 text-center right-0 w-[7rem] z-50 py-2 flex flex-col opacity-0 transition-opacity duration-200">
              <a href="signup.html" class="hover:bg-gray-500">Sign Up</a>
              <a href="login.html" class="hover:bg-gray-500">Login</a>
            </div>
          `;
  
          // Rebind dropdown toggle
          const btn = document.getElementById('dropdownbtn');
          const menu = signInArea.querySelector('#dropdownmenu');
          btn.addEventListener('click', () => {
            menu.classList.toggle('opacity-0');
          });
        }
      })
      .catch(err => console.error('Session check failed:', err));
  });


// ------------------------
// Sign-In Animation (safe check for dynamic injection)
// ------------------------

document.addEventListener("DOMContentLoaded", function () {
    const Dropdownbtn = document.getElementById("dropdownbtn");
    const Dropdownmenu = document.getElementById("dropdownmenu");

    if (Dropdownbtn && Dropdownmenu) {
        Dropdownbtn.addEventListener("click", (event) => {
            event.stopPropagation();
            Dropdownmenu.classList.toggle("opacity-0");
            Dropdownmenu.classList.toggle("pointer-events-none");
        });

        document.addEventListener("click", (event) => {
            if (!Dropdownbtn.contains(event.target)) {
                Dropdownmenu.classList.add("opacity-0");
                Dropdownmenu.classList.add("pointer-events-none");
            }
        });
    }
});

// ------------------------
// Popular Now Animation
// ------------------------

document.addEventListener("DOMContentLoaded", function () {
    const target = document.getElementById("animate-in");

    if (target) {
        function handleScroll() {
            const rect = target.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight * 0.8) {
                target.classList.remove("opacity-0", "translate-x-full");
                target.classList.add("opacity-100", "translate-x-0");
                window.removeEventListener("scroll", handleScroll);
            }
        }

        window.addEventListener("scroll", handleScroll);
        handleScroll();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const target = document.getElementById("animate-heading");

    if (target) {
        function handleScroll() {
            const rect = target.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight * 0.8) {
                target.classList.remove("opacity-0", "-translate-x-full");
                target.classList.add("opacity-100", "translate-x-0");
                window.removeEventListener("scroll", handleScroll);
            }
        }

        window.addEventListener("scroll", handleScroll);
        handleScroll();
    }
});

document.addEventListener('DOMContentLoaded', function () {
  fetch('src/backend/popular_grounds.php')
      .then(response => response.json())
      .then(grounds => {
          const container = document.getElementById('animate-in');
          container.innerHTML = ''; // Clear existing content

          grounds.forEach(ground => {
              const card = document.createElement('div');
              card.className = 'boxcontent w-[23%] bg-white m-5 shadow-2xl rounded-xl text-center flex flex-col items-center justify-center';
              card.innerHTML = `
                  <h1 class="font-sigmar text-xl mt-1 bg-gradient-to-r from-blue-600 to-green-500 inline-block text-transparent bg-clip-text">
                      ${ground.name}
                  </h1>
                  <div class="box-img p-2">
                      <img src="${ground.ground_picture}" alt="" class="rounded-md border-2 border-solid border-black">
                  </div>
                  <button type="button"
                      class="text-white bg-gradient-to-br from-[#013220] to-[#39ff14] hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                      data-ground-id="${ground.ground_id}"
                      data-ground-name="${ground.name}"
                      data-ground-picture="${ground.ground_picture}"
                      onclick="handleBookingClick(event)">
                      Book Now!
                  </button>
              `;
              container.appendChild(card);
          });

          // Make the container visible
          container.classList.remove('opacity-0', 'translate-x-full');
      })
      .catch(error => console.error('Error loading grounds:', error));
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

