document.addEventListener('DOMContentLoaded', function() {
    // Initialize date picker
    flatpickr(".datepicker", {
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: [
            function(date) {
                // Disable past dates
                return date < new Date().setHours(0,0,0,0);
            }
        ]
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const cashRadio = document.getElementById('cash');
    const cardRadio = document.getElementById('card');
    const cardDetails = document.getElementById('cardDetails');

    function toggleCardDetails() {
      if (cardRadio.checked) {
        cardDetails.classList.remove('hidden');
      } else {
        cardDetails.classList.add('hidden');
      }
    }

    // Initial check
    toggleCardDetails();

    cardRadio.addEventListener('change', toggleCardDetails);
    cashRadio.addEventListener('change', toggleCardDetails);
  });

  document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const groundId = params.get('groundId');
    const groundName = params.get('groundName');
    const groundPicture = params.get('groundPicture');


    document.getElementById('groundName').textContent = groundName;
    document.getElementById('groundImage').src = groundPicture;

    document.getElementById('groundIdInput').value = groundId;
});