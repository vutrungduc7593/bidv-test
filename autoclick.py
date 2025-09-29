import pyautogui
import time
import pyperclip

def export_clipboard():
    # 1. Get the content from the clipboard
    try:
        clipboard_content = pyperclip.paste()

        # Check if there is any content
        if clipboard_content:
            # 2. Define the filename
            output_filename = "clipboard_content.txt"

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

# Get your screen resolution
screenWidth, screenHeight = pyautogui.size()
print(f"Your screen size is: {screenWidth}x{screenHeight}")

# Click on Body tab
pyautogui.click(x=877, y=260)
time.sleep(1)

# Click on Send button
pyautogui.click(x=1747, y=214)
time.sleep(3)

# Copy result and export to file json
pyautogui.click(x=1787, y=781)
time.sleep(0.5)

print("Finished clicking by coordinates.")