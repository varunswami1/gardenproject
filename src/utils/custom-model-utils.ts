import * as tf from "@tensorflow/tfjs";
import { toast } from "@/hooks/use-toast";

// Global variables for the directly loaded model
let directDiseaseModel: tf.LayersModel | null = null;
let directDiseaseLabels: string[] = [];
let isModelLoading = false;
let modelLoadPromise: Promise<{ model: tf.LayersModel | null, labels: string[] }> | null = null;

// Cache for model files
const modelCache = new Map<string, ArrayBuffer>();

// Direct model loading function for disease detection
export const loadDiseaseModelDirectly = async (
  modelPath: string = "/models/disease-model/model.json",
  labelsPath: string = "/models/disease-model/labels.json"
): Promise<{ model: tf.LayersModel | null, labels: string[] }> => {
  try {
    // Return existing promise if model is already being loaded
    if (modelLoadPromise) {
      return modelLoadPromise;
    }

    // Check if model is already loaded
    if (directDiseaseModel && directDiseaseLabels.length > 0) {
      console.log("Using cached disease model");
      return { model: directDiseaseModel, labels: directDiseaseLabels };
    }

    // Create new loading promise
    modelLoadPromise = (async () => {
      try {
        isModelLoading = true;

        // Initialize TensorFlow.js with WebGL backend
        await tf.setBackend('webgl');
        await tf.ready();
        console.log("TensorFlow.js initialized with backend:", tf.getBackend());
        
        // First verify all model files are accessible
        try {
          console.log("Verifying model files...");
          const modelResponse = await fetch(modelPath);
          if (!modelResponse.ok) {
            throw new Error(`Model file not found: ${modelResponse.status} ${modelResponse.statusText}`);
          }
          
          const modelJson = await modelResponse.json();
          const shardFiles = modelJson.weightsManifest[0].paths;
          
          // Verify and cache all shard files
          for (const shard of shardFiles) {
            const shardPath = modelPath.substring(0, modelPath.lastIndexOf('/') + 1) + shard;
            
            // Check if shard is already cached
            if (!modelCache.has(shardPath)) {
              const shardResponse = await fetch(shardPath);
              if (!shardResponse.ok) {
                throw new Error(`Shard file ${shard} not found: ${shardResponse.status} ${shardResponse.statusText}`);
              }
              const shardData = await shardResponse.arrayBuffer();
              modelCache.set(shardPath, shardData);
            }
          }
          
          console.log("All model files verified and cached successfully");
        } catch (error) {
          console.error("Error verifying model files:", error);
          throw new Error(`Failed to verify model files: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Load labels first
        try {
          console.log("Loading labels...");
          const response = await fetch(labelsPath);
          if (!response.ok) {
            throw new Error(`Failed to fetch labels: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          directDiseaseLabels = Object.keys(data);
          console.log(`Labels loaded successfully. Found ${directDiseaseLabels.length} classes`);
        } catch (error) {
          console.error("Error loading labels:", error);
          throw new Error(`Failed to load labels: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Load the model with progress tracking
        try {
          console.log("Loading model...");
          directDiseaseModel = await tf.loadLayersModel(modelPath, {
            onProgress: (fraction) => {
              console.log(`Model loading progress: ${(fraction * 100).toFixed(1)}%`);
            }
          });
          
          // Warm up the model
          console.log("Warming up model...");
          const dummyInput = tf.zeros([1, 224, 224, 3]);
          const warmupResult = directDiseaseModel.predict(dummyInput) as tf.Tensor;
          warmupResult.dispose();
          dummyInput.dispose();
          
          console.log("Model loaded and warmed up successfully");
        } catch (error) {
          console.error("Error loading model:", error);
          // Clear any partially loaded model
          directDiseaseModel = null;
          directDiseaseLabels = [];
          throw new Error(`Failed to load model: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Verify model is ready for predictions
        try {
          if (!directDiseaseModel || !directDiseaseModel.inputs || !directDiseaseModel.outputs) {
            throw new Error("Model not properly initialized");
          }

          const inputShape = directDiseaseModel.inputs[0].shape;
          const outputShape = directDiseaseModel.outputs[0].shape;
          console.log("Model architecture:", {
            inputShape,
            outputShape,
            backend: tf.getBackend(),
            memory: tf.memory()
          });

          // Verify model matches number of classes in labels
          const numClasses = outputShape[outputShape.length - 1];
          if (numClasses !== directDiseaseLabels.length) {
            console.warn(`Warning: Number of model classes (${numClasses}) doesn't match number of labels (${directDiseaseLabels.length})`);
          }
        } catch (error) {
          console.error("Error verifying model:", error);
          throw new Error(`Failed to verify model: ${error instanceof Error ? error.message : String(error)}`);
        }

        return { model: directDiseaseModel, labels: directDiseaseLabels };
      } finally {
        isModelLoading = false;
        modelLoadPromise = null;
      }
    })();

    return modelLoadPromise;
  } catch (error) {
    console.error("Error in loadDiseaseModelDirectly:", error);
    throw error;
  }
};

// Function to detect disease using the directly loaded model
export const detectDiseaseWithDirectModel = async (
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<{ name: string; confidence: number } | null> => {
  if (!directDiseaseModel) {
    console.error("Direct disease model not loaded");
    return null;
  }

  try {
    // Ensure we have a valid image element
    if (!imageElement) {
      throw new Error("No image element provided");
    }

    console.log("Starting disease detection process");
    console.log("Image element dimensions:", imageElement.width, "x", imageElement.height);

    // Preprocess image to match model input requirements
    const tensor = tf.tidy(() => {
      // Convert image to tensor
      const imageTensor = tf.browser.fromPixels(imageElement);
      console.log("Original image tensor shape:", imageTensor.shape);

      // Resize image
      const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
      console.log("Resized tensor shape:", resized.shape);

      // Normalize pixel values
      const normalized = resized.toFloat().div(255.0);
      console.log("Normalized tensor shape:", normalized.shape);

      // Add batch dimension
      const batched = normalized.expandDims(0);
      console.log("Final input tensor shape:", batched.shape);

      return batched;
    });

    // Run inference
    console.log("Running prediction with model");
    const predictions = await directDiseaseModel.predict(tensor) as tf.Tensor;
    const probabilities = await predictions.data();
    console.log("Raw prediction probabilities:", probabilities);

    // Get the index with highest probability
    const maxIndex = probabilities.indexOf(Math.max(...Array.from(probabilities)));
    const confidence = probabilities[maxIndex];
    console.log(`Predicted class index: ${maxIndex}, confidence: ${confidence}`);

    // Get the label
    const name = directDiseaseLabels[maxIndex] || `Unknown (Class ${maxIndex})`;
    console.log("Predicted disease:", name);

    // Cleanup tensors
    tf.dispose([tensor, predictions]);
    console.log("Tensors cleaned up");

    return { name, confidence };
  } catch (error) {
    console.error("Error during disease detection:", error);
    return null;
  }
};

// Helper function to check if the model is loaded
export const isDiseaseModelLoaded = (): boolean => {
  return directDiseaseModel !== null && directDiseaseLabels.length > 0;
};

// Function to clear model cache and free memory
export const clearModelCache = () => {
  if (directDiseaseModel) {
    directDiseaseModel.dispose();
    directDiseaseModel = null;
  }
  directDiseaseLabels = [];
  modelCache.clear();
  modelLoadPromise = null;
  isModelLoading = false;
  tf.disposeVariables();
};
