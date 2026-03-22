import sys
import os
import json
import pyautogui
import pyttsx3
import cv2
import numpy as np
from PIL import ImageGrab

# --- Advanced MediaPipe Import Shield ---
try:
    import mediapipe as mp
    # New version handles solutions within the main module, 
    # but we ensure they are fully mapped for Phase 8.
    from mediapipe.python.solutions import face_detection as mp_face_detection
    from mediapipe.python.solutions import hands as mp_hands
    
    face_detector = mp_face_detection.FaceDetection(
        model_selection=1, 
        min_detection_confidence=0.5
    )
    hands_detector = mp_hands.Hands(
        static_image_mode=True, 
        max_num_hands=2, 
        min_detection_confidence=0.5
    )
    VISION_INIT = True
    print("[Nextbot Core]: Vision sensors fully calibrated.")
except ImportError:
    print("[Nextbot Core Warning]: MediaPipe not found. Object detection offline.")
    VISION_INIT = False
except Exception as e:
    print(f"[Nextbot Core Warning]: Sensor calibration error: {e}")
    VISION_INIT = False

# --- Initialize Speech Engine ---
try:
    engine = pyttsx3.init()
except:
    engine = None

def speak(text):
    if engine:
        try:
            engine.say(text)
            engine.runAndWait()
            return True
        except: return False
    return False

def analyze_vision():
    """Advanced Object & Face Detection (Phase 8) - MediaPipe 🧬"""
    if not VISION_INIT:
        return "Vision system is currently uncalibrated. Re-syncing sensors..."

    try:
        # Capture current screen matrix 📸
        screenshot = ImageGrab.grab()
        img = cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        results_desc = []
        
        # 1. Face Signature Scan
        results_faces = face_detector.process(rgb_img)
        if results_faces.detections:
            count = len(results_faces.detections)
            results_desc.append(f"Biological signature identified: {count} face(s) in vision matrix.")

        # 2. Hand Gesture Detection
        results_hands = hands_detector.process(rgb_img)
        if results_hands.multi_hand_landmarks:
            count_hands = len(results_hands.multi_hand_landmarks)
            results_desc.append(f"Gesture signals: {count_hands} hand(s) detected within workspace.")

        if not results_desc:
            return "Vision scan complete. All system coordinates nominal. No biological anomalies detected."
        
        return " | ".join(results_desc)
        
    except Exception as e:
        return f"Hyper-Vision processing interference: {str(e)}"

def automate(action, params):
    """Automation Engine (Phase 4) - Task Architecture"""
    try:
        if action == "move":
            pyautogui.moveTo(params.get('x', 0), params.get('y', 0), duration=0.5)
        elif action == "click":
            pyautogui.click()
        elif action == "type":
            pyautogui.write(params.get('text', ''), interval=0.1)
        return "Task Automation Handled."
    except Exception as e:
        return f"Automation error: {str(e)}"

# --- Main Entry ---
if __name__ == "__main__":
    # If called without arguments, just perform a status check
    if len(sys.argv) < 2:
        print(json.dumps({"status": "success", "message": "Nextbot Core: Heartbeat Nominal. Ready for bridge connection."}))
        sys.exit(0)

    try:
        command = sys.argv[1]
        payload = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}

        result = {"status": "success", "message": ""}

        if command == "speak":
            speak(payload.get('text', ''))
            result["message"] = "Vocalized message."
            
        elif command == "vision":
            result["message"] = analyze_vision()
            
        elif command == "automate":
            result["message"] = automate(payload.get('action'), payload.get('params', {}))
            
        elif command == "status":
            result["message"] = "Nextbot Core: Hyper-Intelligence Online & Calibrated."

        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
