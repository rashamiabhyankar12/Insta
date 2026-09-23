export const imageMap = {
  "Blueberry.jpg":require("../Images/Blueberry.jpg"),
  "Img-03.png": require("../Images/Img-03.png"),
  "Img-10.png": require("../Images/Img-10.png"),

  
  "Catfish.jpg": require("../Images/Catfish.jpg"),
  "Chips.jpg": require("../Images/Chips.jpg"),
  "Duck.jpg": require("../Images/Duck.jpg"),
  "Egg.jpg": require("../Images/Egg.jpg"),
  "Finger-beef.jpg": require("../Images/Finger-beef.jpg"),
  "Greengrape.jpg": require("../Images/Greengrape.jpg"),
  "Img-01.png": require("../Images/Img-01.png"),
  "Img-02.png": require("../Images/Img-02.png"),
  "Img-04.png": require("../Images/Img-04.png"),
  "Img-05.png": require("../Images/Img-05.png"),
  "Img-06.png": require("../Images/Img-06.png"),
  "Img-07.png": require("../Images/Img-07.png"),
  "Img-08.png": require("../Images/Img-08.png"),
  "Img-09.png": require("../Images/Img-09.png"),
  "Img-11.png": require("../Images/Img-11.png"),
 
  "banana.png": require("../Images/banana.png"),
  "bro.png": require("../Images/bro.png"),
  "carrot.png": require("../Images/carrot.png"),
  "cucumber.jpg": require("../Images/cucumber.jpg"),
  "grape.png": require("../Images/grape.png"),
  "pineapple.jpg": require("../Images/pineapple.jpg"),
  "strawberry.png": require("../Images/strawberry.png"),
"watermelon.png": require("../Images/watermelon.png"),
  "Img-14.png": require("../Images/Img-14.png"),
  "Img-15.png": require("../Images/Img-15.png"),
  "Product-8.jpg": require("../Images/Product-8.jpg"),
  "Salmon.jpg": require("../Images/Salmon.jpg"),
  "Tastydaily-2600336736.jpg": require("../Images/Tastydaily-2600336736.jpg"),
  "Tastydaily-2600436451.jpg": require("../Images/Tastydaily-2600436451.jpg")

  // Add more as needed
};
// Helper to normalize image source
export const getImageSource = (imageName) => imageMap[imageName] || null;
