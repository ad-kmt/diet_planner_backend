// Step 1: load data or create some data 

// Step 2: set your neural network options
const options = {
  dataUrl: 'data.csv',
  inputs: [],
  outputs: ['CONCLUSION'],
  task: 'classification'
}

// Step 3: initialize your neural network
const model = ml5.neuralNetwork(options)

// Step 6: train your neural network
const trainingOptions = {
    epochs: 32,
    batchSize: 12
  }

model.train(trainingOptions);

model.save('quiz-model');

