from flask import Flask, render_template, request
import requests
import feedparser
import urllib.parse
from datetime import datetime

app = Flask(__name__)

def get_news(query):
    # Properly URL encode query parameters
    encoded_query = urllib.parse.quote(query)
    url = f'https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en'

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    response = requests.get(url, headers=headers)
    feed = feedparser.parse(response.text)

    sorted_entries = sorted(
        feed.entries, 
        key=lambda entry: getattr(entry, 'published_parsed', None) or (0,)*9, 
        reverse=True
    )

    news_data = []
    for entry in sorted_entries:
        # Google RSS titles usually look like: "Headline goes here - Publisher Name"
        raw_title = entry.title
        source = ""
        clean_title = raw_title

        if " - " in raw_title:
            parts = raw_title.rsplit(" - ", 1)
            clean_title = parts[0]
            source = parts[1]

        # Format published date to short string if available
        published_str = entry.published
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            published_str = datetime(*entry.published_parsed[:6]).strftime('%b %d, %Y')

        news_data.append({
            'title': raw_title,
            'clean_title': clean_title,
            'source': source,
            'link': entry.link,
            'published': published_str
        })

    return news_data

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        query = request.form.get('query', '').strip()
        if query:
            news_data = get_news(query)
            return render_template('index.html', query=query, news_data=news_data)

    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=False)