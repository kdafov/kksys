import requests
from datetime import datetime

# Constants
API_KEY = 'KEY'
BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast'
LATITUDE = 10
LONGITUDE = 10

def get_day_of_week(date_string):
    """
    Extracts and returns the day of the week from a given date string.
    """
    date_object = datetime.strptime(date_string, '%Y-%m-%d %H:%M:%S')
    return date_object.strftime('%a')


def get_hour_am_pm(date_string):
    """
    Extracts and formats the hour and AM/PM designation from a given date string.
    """
    parsed_date = datetime.strptime(date_string, "%Y-%m-%d %H:%M:%S")
    hour = parsed_date.strftime("%I")
    am_pm = parsed_date.strftime("%p")
    return f"{hour} {am_pm}"


def run_forecast():
    """
    Fetches and processes weather forecast data from the OpenWeatherMap API.
    Returns a list of weather data with day, time, temperature, and weather description.
    """
    try:
        # Build the API request URL
        url = f"{BASE_URL}?lat={LATITUDE}&lon={LONGITUDE}&appid={API_KEY}&units=metric"

        # Make the API request
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse JSON response
        json_data = response.json()

        flat_data = []
        for weather_entry in json_data.get('list', []):
            # Extract and format data
            day = get_day_of_week(weather_entry['dt_txt'])
            timeframe = get_hour_am_pm(weather_entry['dt_txt'])
            temp_min = round(float(weather_entry['main']['temp_min']))
            temp_max = round(float(weather_entry['main']['temp_max']))
            weather_main = weather_entry['weather'][0]['main']
            weather_icon = weather_entry['weather'][0]['icon']

            # Append formatted data to the list
            flat_data.append([f"{day} {timeframe}", temp_min, temp_max, weather_main, weather_icon])

        return flat_data

    except requests.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return []


if __name__ == "__main__":
    forecast_data = run_forecast()
    for entry in forecast_data:
        print(entry)
