const PALM_API_KEY = 'Your PaLM API Key'; // Get your API key from https://makersuite.google.com/app/apikey
const PALM_API_URL = 'https://generativelanguage.googleapis.com/v1beta3/models/chat-bison-001:generateMessage?key=' + PALM_API_KEY;

function onOpen() {
  var ui = SlidesApp.getUi();
  ui.createMenu('Slide Generator')
    .addItem('Generate Slides', 'generateSlides')
    .addToUi();
}

function generateSlides() {
  const prompt = getPrompt();

  if (prompt) {
    SlidesApp.getUi().alert('Generating Slides...');
    const payload = {
      "prompt": { "messages": [{ "content": "You are a slideshow creator. start each slide with ## Slided <number>: <title>. Remember to keep your slides short to ensure the content fits, and also markdown does not format, so dont bother using it.Generate slides about " + prompt + ". make sure you include tags like '## Slide 1: <slide 1 title>', etc.. Keep the content short per slide so it all fits" }] },
      "temperature": 0.7,
      "candidateCount": 1
    };

    try {
      // Make the API request
      const response = UrlFetchApp.fetch(PALM_API_URL, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload)
      });

      // Parse the API response
      const responseData = JSON.parse(response.getContentText());

      // Extract the generated response
      const generatedResponse = responseData.candidates[0].content;

      // Create slides based on the structure
      createSlides(generatedResponse);
    } catch (error) {
      console.error('Error:', error);
      SlidesApp.getUi().alert('Error generating slides. Please try again.');
    }
  }
}

function getPrompt() {
  const ui = SlidesApp.getUi();
  const result = ui.prompt('Enter your topic:');
  return result.getResponseText();
}

function createSlides(generatedResponse) {
  const slides = generatedResponse.split('## Slide ');

  // Remove the empty first element
  slides.shift();

  // Iterate through each slide and create it
  slides.forEach((slide, index) => {
    const slideParts = slide.split('\n');
    const title = slideParts[0].trim();
    const content = slideParts.slice(1).join('\n').trim();

    // Create a new slide with the title and content
    createSlide(title, content);
  });
}

function createSlide(title, content) {
  // Get the active presentation
  const presentation = SlidesApp.getActivePresentation();

  // Create a new slide
  const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);

  // Set the title and content
  const titleShape = slide.getShapes()[0];
  const contentShape = slide.getShapes()[1];
  titleShape.getText().setText(title);
  contentShape.getText().setText(content);
}
