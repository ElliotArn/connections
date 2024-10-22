document.addEventListener('DOMContentLoaded', async () => {
  let squares = Array.from(document.querySelectorAll('.square'));
  const submitButton = document.getElementById('submit-button');
  const grid = document.getElementById('grid');
  const selectedContainer = document.getElementById('selected-container');
  const tries = document.getElementById('tries');
  const away = document.getElementById('away');
  let selectedSquares = [];
  let triesValue =4;
  // Fetch data from the backend and populate squares
  async function fetchAndPlaceSquares(year, month, day) {
    const response = await fetch('/api/connections/'+year+'/'+ month + '/' + day);
    const data = await response.json();
    if (data.success) {
      setDateCookie(year + '_' + month + '_' + day);
      squares.forEach((square, index) => {
        square.textContent = data.data[index];
      });
    } else {
      console.log('Failed to fetch data:', data.message);
    }
  }


  function addEventSquare(){
    squares.forEach(square => {
      square.addEventListener('click', () => {
        if (selectedSquares.includes(square.textContent)) {
          // Deselect if already selected
          selectedSquares = selectedSquares.filter(item => item !== square.textContent);
          square.classList.remove('selected');
        } else {
          // Select square
          selectedSquares.push(square.textContent);
          square.classList.add('selected');
        }
      });
    });
  }

  addEventSquare();
  // Function to move selected squares to the top container
  function moveSelectedSquares(theme, color) {
    // Create a new block for the group of 4 squares
    const newBlock = document.createElement('div');
    newBlock.classList.add('square-block'); // Add a class for styling
    newBlock.textContent = '\"' + theme + '\": '
    selectedSquares.forEach(selectedSquare => {
      // Create a new element for each selected square in the block
      
      newBlock.classList.add('selected-square');
      newBlock.textContent += ", " + selectedSquare;

      // Find the square element in the grid and hide it
      const squareElement = squares.find(square => square.textContent === selectedSquare);
      if (squareElement) {
        squareElement.remove();

      }
    });

    if(color === 'yellow') newBlock.style.backgroundColor = '#ffffb3';
    if(color === 'green') newBlock.style.backgroundColor = '#b2fab4';
    if(color === 'blue') newBlock.style.backgroundColor = '#aecbfa';
    if(color === 'purple') newBlock.style.backgroundColor = '#dc90c9';
    
    updateCleared(color);
    // Append the new block to the container
    selectedContainer.appendChild(newBlock);
  }

  document.getElementById('date-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from reloading the page
    const selectedDate = document.getElementById('selected-date').value;
    if (selectedDate) {
      const datesArray = selectedDate.split("-");

      datesArray[1] = datesArray[1].replace(/^0/, '');
      datesArray[2] = datesArray[2].replace(/^0/, '');
      try {
        selectedContainer.innerHTML = '';
        clearAllCookies();
        grid.innerHTML = '<div class="square" id="square1">1</div> <div class="square" id="square2">2</div> <div class="square" id="square3">3</div> <div class="square" id="square4">4</div> <div class="square" id="square5">5</div> <div class="square" id="square6">6</div> <div class="square" id="square7">7</div> <div class="square" id="square8">8</div> <div class="square" id="square9">9</div> <div class="square" id="square10">10</div> <div class="square" id="square11">11</div> <div class="square" id="square12">12</div> <div class="square" id="square13">13</div> <div class="square" id="square14">14</div> <div class="square" id="square15">15</div> <div class="square" id="square16">16</div>';
        squares = Array.from(document.querySelectorAll('.square'));
        addEventSquare();
        triesValue = 4;
        setTries(triesValue);
        fetchAndPlaceSquares(datesArray[0], datesArray[1], datesArray[2]);
      } catch (error) {
        alert(error);
      }
    }
    // Add your logic to handle the selected date here
  });
  


  submitButton.addEventListener('click', () => {
    if (selectedSquares.length !== 4) {
      alert("Select exactly 4 squares");
    } else {
      checkSelection();
    }
  });


  async function setCleared(cleared) {
    const colors = cleared.split("_");

    for (let index = 0; index < colors.length; index++) {
      let color = colors[index]
      try {
        const response = await fetch(`/api/getColor/${color}`); // Fetch data from the endpoint
        const data = await response.json(); // Parse the JSON response

        if (response.ok) {
          if(data.success){
            selectedSquares = data.words;
            moveSelectedSquares(data.category, color);
            selectedSquares = [];
          }
        } else {
          console.error('Error fetching color squares:', data.message);
        }
      } catch (error) {
        console.error('Fetch failed:', error);
      }
      
    }
  }
  

  // Check selection with the backend
  async function checkSelection() {
    const response = await fetch('/api/connections/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ selectedSquares })
    });

    const data = await response.json();

    if (data.success) {
      moveSelectedSquares(data.text, data.color);
      away.textContent = "";
    } else if(data.wrong === 1){
      triesValue--;
      setTries(triesValue);
      away.textContent = "one away";
    }
    else {
      triesValue--;
      setTries(triesValue);
      away.textContent = "";
    }

    // Reset selections after checking
    selectedSquares = [];
    squares.forEach(square => square.classList.remove('selected'));
  }

  function updateCleared(color) {
    const clear = getCookie("cleared");
    
    if(clear === null){
      setClearedCookie(color);
    } else {

      const array = clear.split("_");
      if(!array.includes(color)) setClearedCookie(clear + "_" + color);
      
    }
  }
  

  function setCookie(name, value, days) {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
      const cookieValue = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/;`;
      document.cookie = cookieValue;
  }

  // Function to get a cookie value by name
  function getCookie(name) {
      const nameEQ = `${name}=`;
      const cookies = document.cookie.split(';');
      
      for (let i = 0; i < cookies.length; i++) {
          let cookie = cookies[i].trim();
          if (cookie.indexOf(nameEQ) === 0) return decodeURIComponent(cookie.substring(nameEQ.length));
      }
      
      return null; // Return null if the cookie is not found
  }
  function setTries(number) {
    tries.textContent = number;
    triesValue = number;
    setTriesCookie(number);
  }
  // Function to update a cookie
  function updateCookie(name, value, days) {
      // Simply set the cookie again to update it
      setCookie(name, value, days);
  }

  // Function to set the specific cookies
  function setDateCookie(dateValue) {
      setCookie('date', dateValue, 2); // Expires in 2 days
  }

  function setTriesCookie(number) {
      setCookie('tries', number.toString(), 2); // Expires in 2 days
  }

  function setClearedCookie(clearedValue) {
      setCookie('cleared', clearedValue, 2); // Expires in 2 days
  }
  async function getInfo() {
    const date = getCookie("date");
    const cleared = getCookie("cleared");
    const tries = getCookie("tries");
    if (date !== null){
      const array = date.split("_");
      await fetchAndPlaceSquares(array[0], array[1], array[2]);


      if (tries !== null) setTries(Number(tries));
      if (cleared !== null) setCleared(cleared);
  
    }
  }
  
  function clearAllCookies() {
    const cookies = document.cookie.split(';');
      
      // Loop through all cookies and clear them
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }

  getInfo();
  // Initial fetching and placement of squares
});

