import pyautogui
import time
import pyperclip
import keyboard
from datetime import datetime
import os

def export_clipboard(filename):
    # 1. Get the content from the clipboard
    try:
        clipboard_content = pyperclip.paste()

        # Check if there is any content
        if clipboard_content:
            # 2. Define the filename
            output_filename = filename

            # 3. Write the content to the file
            # The 'w' means 'write mode', which will overwrite the file if it already exists.
            with open(output_filename, 'w', encoding='utf-8') as f:
                f.write(clipboard_content)

            print(f"Successfully saved clipboard content to '{output_filename}'")
        else:
            print("The clipboard is empty.")

    except pyperclip.PyperclipException as e:
        print(f"Could not access the clipboard. Error: {e}")
        print("On Linux, you might need to install xclip or xsel.")
        print("Run: 'sudo apt-get install xclip' or 'sudo yum install xsel'")

def run_autoclick(i, session_id):
    # Click on Body tab
    pyautogui.click(x=877, y=260)
    time.sleep(1)

    # Click on Send button
    pyautogui.click(x=1747, y=214)
    time.sleep(3)

    # Copy result and export to file json
    pyautogui.click(x=1787, y=781)
    time.sleep(0.5)

    export_clipboard(f"data/{session_id}/api_result_{i}.json")

    # Take screenshot
    pyautogui.screenshot(f"data/{session_id}/api_result_{i}.png")
    print(f"Screenshot saved to data/{session_id}/api_result_{i}.png")
    
    # Send Ctrl + Tab to switch to another tab
    keyboard.press('ctrl')
    keyboard.press('tab')
    keyboard.release('ctrl')
    keyboard.release('tab')
    time.sleep(1)

def run():
    # Get your screen resolution
    screenWidth, screenHeight = pyautogui.size()
    print(f"Your screen size is: {screenWidth}x{screenHeight}")

    total_items = 3

    session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    # make folder for session
    os.makedirs(f"data/{session_id}", exist_ok=True)

    print("Waiting for 3 seconds to start autoclick")
    time.sleep(3)

    for i in range(total_items):
        print(f"Running {i+1} of {total_items}")
        run_autoclick(i, session_id)

    print("Finished autoclick.")

run()