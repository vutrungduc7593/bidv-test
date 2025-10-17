import pyautogui
import time
import threading
from pynput import keyboard
from datetime import datetime

# List to store recorded positions
recorded_positions = []
recording_active = True

def on_press(key):
    global recording_active
    try:
        if key == keyboard.Key.space:
            # Record current mouse position
            x, y = pyautogui.position()
            timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]  # millisecond precision
            recorded_positions.append({
                'x': x,
                'y': y,
                'timestamp': timestamp
            })
            print(f"\nRecorded position: X: {str(x).rjust(4)} Y: {str(y).rjust(4)} at {timestamp}")
            return
        elif key == keyboard.Key.esc:
            # Quit the program
            recording_active = False
            return False
    except Exception as e:
        print(f"\nError recording position: {e}")

def display_recorded_positions():
    """Display all recorded positions"""
    if not recorded_positions:
        print("\nNo positions recorded yet.")
        return

    print(f"\n{'='*50}")
    print("RECORDED POSITIONS:")
    print(f"{'='*50}")
    print(f"{'#'.ljust(3)} {'X'.ljust(6)} {'Y'.ljust(6)} {'Timestamp'}")
    print(f"{'-'*50}")

    for i, pos in enumerate(recorded_positions, 1):
        print(f"{str(i).ljust(3)} {str(pos['x']).ljust(6)} {str(pos['y']).ljust(6)} {pos['timestamp']}")

    print(f"{'='*50}")
    print(f"Total positions recorded: {len(recorded_positions)}")

def save_positions_to_file():
    """Save recorded positions to a file"""
    if not recorded_positions:
        print("\nNo positions to save.")
        return

    filename = f"recorded_positions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    try:
        with open(filename, 'w') as f:
            f.write("RECORDED MOUSE POSITIONS\n")
            f.write("=" * 50 + "\n")
            f.write(f"Recorded on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Total positions: {len(recorded_positions)}\n\n")

            for i, pos in enumerate(recorded_positions, 1):
                f.write(f"{i}. X: {pos['x']}, Y: {pos['y']} (recorded at {pos['timestamp']})\n")

        print(f"\nPositions saved to: {filename}")
    except Exception as e:
        print(f"\nError saving file: {e}")

# Start keyboard listener in a separate thread
listener = keyboard.Listener(on_press=on_press)
listener.start()

print("Mouse Position Recorder")
print("=" * 30)
print("Instructions:")
print("- Move your mouse to the desired position")
print("- Press SPACEBAR to record the current position")
print("- Press ESC to quit and show recorded positions")
print("- Press 'S' while the program is running to save positions to file")
print("- Press Ctrl-C as alternative way to quit")
print("-" * 30)

try:
    while recording_active:
        x, y = pyautogui.position()
        positionStr = f'Current: X: {str(x).rjust(4)} Y: {str(y).rjust(4)} | Recorded: {len(recorded_positions)}'
        print(positionStr, end='')
        print('\b' * len(positionStr), end='', flush=True)
        time.sleep(0.1)

except KeyboardInterrupt:
    pass
finally:
    print('\n' + '='*50)
    display_recorded_positions()

    # Ask if user wants to save to file
    try:
        save_input = input("\nSave positions to file? (y/n): ").lower().strip()
        if save_input == 'y':
            save_positions_to_file()
    except:
        pass

    print("\nGoodbye!")
