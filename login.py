import asyncio
from twikit import Client, TooManyRequests
import time
from datetime import datetime
import csv
from configparser import ConfigParser
from random import randint
import httpx

#* Login credentials
config = ConfigParser()
config.read('config.ini')
username = config['X']['username']
email = config['X']['email']
password = config['X']['password']

async def main():
    #* Authenticate to X.com
    client = Client(language='en-US')
    await client.login(auth_info_1=username, auth_info_2=email, password=password)  # ✅ Await the login
    
    # Save cookies (assuming this is a sync function)
    client.save_cookies('cookies.json')  # ❌ Don't await this if it's synchronous

# Run the async function
asyncio.run(main())
