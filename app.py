from flask import Flask, render_template, request
import requests
import feedparser

app = Flask(__name__)

def get_news(query):
    url = f'https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en'

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36'
    }

    response = requests.get(url, headers=headers)
    feed = feedparser.parse(response.text)

    sorted_entries = sorted(feed.entries, key=lambda entry: entry.published_parsed, reverse=True)

    news_data = []
    for entry in sorted_entries[:len(feed.entries)]:
        news_data.append({
            'title': entry.title,
            'link': entry.link,
            'published': entry.published
        })

    return news_data

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        query = request.form['query']
        if query:
            news_data = get_news(query.replace(" ", "+"))
            return render_template('index.html', query=query, news_data=news_data)

    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=False)
