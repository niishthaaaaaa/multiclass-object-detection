from ultralytics import YOLO
import cv2
import sys

# DroidCam connection options:
# Option 1: If DroidCam is installed as virtual webcam driver, try these indices
# Option 2: Use IP address directly (replace with your phone's IP from DroidCam app)

# Try Option 1: DroidCam virtual camera (usually appears as a higher index)
def find_droidcam():
    """Try to find DroidCam among available cameras"""
    for i in range(10):  # Check first 10 camera indices
        cap = cv2.VideoCapture(i, cv2.CAP_DSHOW)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                print(f"Found working camera at index {i}")
                cap.release()
                return i
            cap.release()
    return None

# Option 2: Direct IP connection (recommended)
# Replace with your phone's IP address shown in DroidCam app
# Format: "http://192.168.X.X:4747/video"
DROIDCAM_IP = "http://192.168.1.2:4747/video"  # Change this to your phone's IP

print("Attempting to connect to DroidCam...")
print(f"Make sure DroidCam is running on your phone and connected to the same network")

# Try IP connection first (more reliable)
cap = cv2.VideoCapture(DROIDCAM_IP)
source = DROIDCAM_IP

if not cap.isOpened():
    print(f"Could not connect via IP: {DROIDCAM_IP}")
    print("Trying to find DroidCam virtual camera...")
    
    # Fall back to searching for virtual camera
    camera_index = find_droidcam()
    if camera_index is not None:
        source = camera_index
        cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
    else:
        print("❌ Cannot find DroidCam camera.")
        print("\nTroubleshooting steps:")
        print("1. Make sure DroidCam app is running on your phone")
        print("2. Check that your phone and PC are on the same WiFi network")
        print("3. Update the DROIDCAM_IP variable with your phone's IP (shown in DroidCam app)")
        print("4. If using DroidCam Client, make sure it's connected")
        print("5. Try changing camera_index from 0 to 1, 2, or 3")
        cap.release()
        sys.exit(1)

# Test the connection
ret, frame = cap.read()
if not ret:
    print("❌ Camera opened but cannot read frames")
    cap.release()
    sys.exit(1)

print(f"✓ Successfully connected to DroidCam!")
cap.release()

# Load YOLO model
print("Loading YOLO model...")
model = YOLO("best_model_backup.onnx")

try:
    print("Starting object detection...")
    print("Press 'q' to quit")
    
    # Run prediction with the DroidCam source
    results = model.predict(source=source, show=True, conf=0.5)
    
except ConnectionError as e:
    print("Prediction failed:", e)
    print("Camera connection was lost. Please check DroidCam connection.")
except KeyboardInterrupt:
    print("\nStopped by user")
except Exception as e:
    print(f"Error occurred: {e}")
finally:
    cv2.destroyAllWindows()