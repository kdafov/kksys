from datetime import datetime, timedelta

def return_temp_array(data):
    """
    Processes temperature data for the last 12 hours, calculates hourly averages,
    and returns an array of average temperatures per hour.
    """
    current_time = datetime.now()

    # Filter data for the last 12 hours
    filtered_data = [
        record for record in data if current_time - record[0] <= timedelta(hours=12)
    ]

    # Create a dictionary for hourly temperature updates
    hourly_temps = {}
    for record in filtered_data:
        hour_key = record[0].replace(minute=0, second=0, microsecond=0)
        hourly_temps.setdefault(hour_key, []).append(float(record[1]))

    # Calculate hourly averages
    hourly_averages = {
        hour_key: sum(temps) / len(temps) for hour_key, temps in hourly_temps.items()
    }

    # Fill missing hours with 0 or existing averages
    hours_to_return = {}
    for i in range(1, 13):
        hour_key = (current_time - timedelta(hours=i)).replace(
            minute=0, second=0, microsecond=0
        )
        hours_to_return[hour_key] = hourly_averages.get(hour_key, 0)

    # Format results as a list of strings
    result_array = [f"{avg_temp:.1f}" for avg_temp in hours_to_return.values()]
    return result_array


def return_rain_data(rain_data):
    """
    Processes rain duration data for the last 12 hours and calculates precipitation
    levels (in mm) for each hour based on predefined intervals.
    """
    current_time = datetime.now().replace(minute=0, second=0, microsecond=0)
    hourly_precipitation = []

    # Iterate over the last 12 hours
    for i in range(12):
        hour_start = current_time - timedelta(hours=i + 1, minutes=30)
        hour_end = current_time - timedelta(hours=i, minutes=30)

        # Calculate total duration of rain for the current hour
        total_duration = sum(
            duration for timestamp, duration in rain_data if hour_start < timestamp <= hour_end
        )

        # Determine precipitation level (in mm) based on rain duration
        if 0 < total_duration <= 3:
            precipitation_mm = 10
        elif 4 <= total_duration <= 9:
            precipitation_mm = 20
        elif 10 <= total_duration <= 15:
            precipitation_mm = 30
        elif 16 <= total_duration <= 20:
            precipitation_mm = 40
        elif 21 <= total_duration <= 30:
            precipitation_mm = 50
        elif 31 <= total_duration <= 35:
            precipitation_mm = 60
        elif 36 <= total_duration <= 40:
            precipitation_mm = 70
        elif 41 <= total_duration <= 45:
            precipitation_mm = 80
        elif 46 <= total_duration < 53:
            precipitation_mm = 90
        elif total_duration >= 53:
            precipitation_mm = 100
        else:
            precipitation_mm = 0

        # Append precipitation level for the hour
        hourly_precipitation.append(precipitation_mm)

    # Reverse the list to have the most recent data first
    hourly_precipitation.reverse()
    return hourly_precipitation
