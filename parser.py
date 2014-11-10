import urllib2
import json
from bs4 import BeautifulSoup

pages = [
	"http://en.wikipedia.org/wiki/List_of_killings_by_law_enforcement_officers_in_the_United_States,_2011",
	"http://en.wikipedia.org/wiki/List_of_killings_by_law_enforcement_officers_in_the_United_States,_2010",
	"http://en.wikipedia.org/wiki/List_of_killings_by_law_enforcement_officers_in_the_United_States,_2009"	
]

months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
]

years = [
	"2014",
	"2013",
	"2012"
]

data = []

columns = [
	"date", "name", "state", "desc"
]

for url in pages:
	page = urllib2.urlopen(url).read()
	soup = BeautifulSoup(page)
	tables = soup.find_all("table", class_="wikitable")
	for table in tables:
		rows = table.find_all("tr")
		for row in rows:
			killing = {}
			cells = row.find_all("td")	
			for col, cell in enumerate(cells):
				for tag in cell.find_all(True):
					tag.decompose()
				killing[columns[col]] = ' '.join(cell.contents)
			data.append(killing)
text_file = open("test.json", "w")
text_file.write(json.dumps(data))
text_file.close()



	
