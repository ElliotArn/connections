
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
let con = 0;
app.use(bodyParser.json()); // Middleware to parse JSON bodies

class Connect {
  constructor(year, month, day) {
    this.yellow = [];
    this.green = [];
    this.blue = [];
    this.purple = [];

    this.yellowText = "";
    this.greenText = "";
    this.blueText = "";
    this.purpleText = "";

    this.year = year;
    this.month = month;
    this.day = day;
  }

  // Method to load data from JSON files
  // Method to load data from JSON object
  loadData(jsonData) {
    // Assign values from the JSON object
    this.year = jsonData.year;
    this.month = jsonData.month;
    this.day = jsonData.day;

    // Assign the first elements as text and the rest as arrays
    this.yellowText = jsonData.yellow[0];
    this.yellow = jsonData.yellow.slice(1);

    this.greenText = jsonData.green[0];
    this.green = jsonData.green.slice(1);

    this.blueText = jsonData.blue[0];
    this.blue = jsonData.blue.slice(1);

    this.purpleText = jsonData.purple[0];
    this.purple = jsonData.purple.slice(1);
  }


  // Method to check if two arrays are the same
  isArraySame(array1, array2) {
  // Check if lengths are the same
    if (array1.length !== array2.length) return [false, -1];
    let wrong = 0;
    // Sort both arrays and check if every element matches
    for (let index = 0; index < array1.length; index++) {
      if (!array2.includes(array1[index])) wrong++;
    }
    if(wrong === 0) return [true];
    else return [false , wrong];
}

  // Method to test the four groups (yellow, green, blue, purple)
  testFour(array) {
    let wrong = 4;

    let ret = this.isArraySame(array, this.yellow);
    if(ret[1] < wrong) wrong = ret[1];
    if (ret[0]) return { success: true, color: 'yellow', text: this.yellowText };

    ret = this.isArraySame(array, this.green);
    if(ret[1] < wrong) wrong = ret[1];
    if (ret[0]) return { success: true, color: 'green', text: this.greenText };
    
    ret = this.isArraySame(array, this.blue);
    if(ret[1] < wrong) wrong = ret[1];
    if (ret[0]) return { success: true, color: 'blue', text: this.blueText };
    
    ret = this.isArraySame(array, this.purple);
    if(ret[1] < wrong) wrong = ret[1];
    if (ret[0]) return { success: true, color: 'purple', text: this.purpleText };
    return { success: false , wrong: wrong };
  }
  getArray() {
    // Concatenate all color arrays (yellow, green, blue, purple) into one array
    const combinedArray = this.yellow.concat(this.green, this.blue, this.purple);

    // Shuffle the combined array
    const shuffledArray = combinedArray.sort(() => Math.random() - 0.5);

    // Return the shuffled array
    return shuffledArray;
  }
  getColor(farg){
    if(farg === 'yellow')return {
      category: this.yellowText,
      words: this.yellow,
      success : true
    };
    if(farg === 'green')return {
      category: this.greenText,
      words: this.green,
      success : true
    };
    if(farg === 'blue')return {
      category: this.blueText,
      words: this.blue,
      success : true
    };
    if(farg === 'purple')return {
      category: this.purpleText,
      words: this.purple,
      success : true
    };
    return {
      success: false
    };
  }
}

// API endpoint to validate the selected squares
app.post('/api/connections/test', async (req, res) => {
  const { selectedSquares } = req.body;
  
  try {
    // Load the data
    // Test the selected squares
    const result = con.testFour(selectedSquares);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing request', error });
  }
});



app.get('/api/getColor/:color', (req, res) => {
  const color = req.params.color; // Extract the color from the request
  const ret = con.getColor(color); // Assuming con.getColor(color) returns an array
  if (ret) {
    res.json(ret); // Send the array of squares back as JSON
  } else {
    res.status(404).json({ message: 'Color not found' });
  }
});


app.get('/api/connections/:year/:month/:day', async (req, res) => {
  const { year, month, day } = req.params;
  const jsonFile = path.join(__dirname, `/connections/${year}_${month}_${day}.json`);

  // Check if the file exists before reading
  if (!fs.existsSync(jsonFile)) {
    return res.status(404).json({ success: false, message: 'JSON file not found' });
  }

  // Read the file
  fs.readFile(jsonFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error reading JSON file' });
    }

    try {
      const jsonData = JSON.parse(data);  // Parse the JSON file
      // Initialize Connect class without loading from file
      con = new Connect(jsonData.year, jsonData.month, jsonData.day);
      
      con.loadData(jsonData);  // Pass the JSON object to the loadData method
      
      // Scramble the list using getArray() method from Connect class
      const scrambledData = con.getArray();

      // Send the scrambled data as JSON
      res.json({ success: true, data: scrambledData });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Invalid JSON format' });
    }
  });
});

// Serve static files like your frontend HTML/CSS/JS
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

