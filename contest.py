#!/bin/python3
import requests
from bs4 import BeautifulSoup
import json as json


#hej hejs test
months = [
    ("January", 31),
    ("February", 29),  # Assume leap year for now, but can adjust later if needed
    ("March", 31),
    ("April", 30),
    ("May", 31),
    ("June", 30),
    ("July", 31),
    ("August", 31),
    ("September", 30),
    ("October", 31),
    ("November", 30),
    ("December", 31)
]


month_to_number = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12
}


class Connections:
    def __init__(self, year, month, day, yellow, green, blue, purple):
        self.year = year
        self.month = month
        self.day = day
        self.yellow = yellow
        self.green = green
        self.blue = blue
        self.purple = purple

    def to_dict(self):
        return {
            "year": self.year,
            "month": self.month,
            "day": self.day,
            "yellow": self.yellow,
            "green": self.green,
            "blue": self.blue,
            "purple": self.purple
        }

def getURL(year, month, day):
    return "https://mashable.com/article/nyt-connections-hint-answer-today-"+month+"-"+str(day)+"-"+str(year)


# Step 1: Send an HTTP request to the website
def scrape(year, month, day):

    url =  getURL(year, month, day) # tual website URL you want to scrape
    response = requests.get(url)

# Check if the request was successful
    if response.status_code == 200:
        # Step 2: Parse the HTML
        soup = BeautifulSoup(response.content, 'html.parser')

        # Step 3: Find the header and list items after it
        header = soup.find('h2', string="What is the answer to Connections today")  # Replace "HEADER" with the actual text you are looking for

        if header is None:
            print("The <h2>HEADER</h2> tag was not found in the HTML.")
        else:
            # Get all the following list items (<li>) after the header
            ul = header.find_next('ul')
        
            if ul is None:
                print("No <ul> found after the <h2>HEADER</h2>.")
            else:
            # Find all <li> elements within the <ul>
                list_items = ul.find_all('li')
                count =0
                info = [[],[],[],[]]           
            # Loop through each <li> and extract the content
                for item in list_items:
                    category = item.find('strong').text.strip(":")
                    details = item.get_text().replace(category, '').strip(":")
                    list = details.split(", ")
                    list.insert(0, category)
                    #print(f"{category} {details}")
                    #print(type(category))
                    info[count] = list
                    count+=1
                    #soulution = Connections() 
                connect = Connections(year, month, day, info[0], info[1], info[2], info[3])
                jsoncon = json.dumps(connect.to_dict(), indent=4)
                name = "connections/"+str(year)+"_"+str(month_to_number[month])+"_"+str(day)+".json"

                with open(name, "w") as file:
                    json.dump(connect.to_dict(), file, indent=4)
                print(name)
    else:
        print(f"Failed to retrieve the webpage. Status code: {response.status_code}")




def is_leap_year(year):
    """Check if a year is a leap year."""
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

def days_in_february(year):
    """Return the number of days in February for a given year."""
    return 29 if is_leap_year(year) else 28


for day in range(8):
    scrape(2024,"September",day+23)
