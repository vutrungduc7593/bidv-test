import pyautogui
import time
import pyperclip
import keyboard
from datetime import datetime
import os
import json

def get_api_name_from_clipboard():
    clipboard_content = pyperclip.paste()
    return clipboard_content

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

def run_autoclick(session_id):
    time.sleep(1)

    # TODO: check if api_name is in format of API_(number+), if not, wait 5 more seconds and try again
    max_retries = 3
    retry_count = 0
    while retry_count < max_retries:
        pyautogui.click(x=834, y=143)
        time.sleep(0.5)
        # press ctrl + c
        keyboard.press('ctrl')
        keyboard.press('c')
        keyboard.release('ctrl')
        keyboard.release('c')
        time.sleep(0.5)
        api_name = get_api_name_from_clipboard()
        time.sleep(0.5)

        if not api_name.startswith('API_'):
            time.sleep(3)
            retry_count += 1
        else:
            break
    if retry_count == max_retries:
        print(f"Failed to get valid API name after {max_retries} attempts. Exiting.")
        return
    
    # Click on Body tab
    pyautogui.click(x=877, y=260)
    time.sleep(1)

    # Click on Send button
    pyautogui.click(x=1747, y=214)
    time.sleep(3)

    # Validate clipboard is json or not, if not, wait 5 more seconds and try again
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        # Copy result and export to file json
        pyautogui.click(x=1787, y=781)
        time.sleep(0.5)

        clipboard_content = pyperclip.paste()
        
        # Check if clipboard content is valid JSON
        try:
            json.loads(clipboard_content)
            # If we get here, it's valid JSON
            break
        except json.JSONDecodeError:
            retry_count += 1
            if retry_count < max_retries:
                print(f"Clipboard content is not valid JSON. Retrying in 5 seconds... (Attempt {retry_count + 1}/{max_retries})")
                time.sleep(3)
            else:
                print(f"Failed to get valid JSON after {max_retries} attempts. Saving raw content anyway.")
                break

    export_clipboard(f"data/{session_id}/api_result_{api_name}.json")

    # Take screenshot
    pyautogui.screenshot(f"data/{session_id}/api_result_{api_name}.png")
    print(f"Screenshot saved to data/{session_id}/api_result_{api_name}.png")
    
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

    total_items = 47

    session_id = 'api-test-result'
    # make folder for session
    os.makedirs(f"data/{session_id}", exist_ok=True)

    print("Waiting for 5 seconds to start autoclick")
    time.sleep(5)

    for i in range(total_items):
        print(f"Running {i+1} of {total_items}")
        run_autoclick(session_id)

    print("Finished autoclick.")

run()