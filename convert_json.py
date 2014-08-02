import random
import re
import sys
import time
import urllib.request
from urllib.parse import quote

def getYoutubeId(song):
	song = re.sub(r'\([^)]*\)', '', song)
	searchText = urllib.parse.quote(song)
	print(searchText)
	youTubeUrl = 'https://www.youtube.com/results?search_query=' + searchText
	matchId = 'tile clearfix" data-context-item-id="'
	matchTime = '<span class="video-time">'

	response = urllib.request.urlopen(youTubeUrl)
	body = str(response.read(), encoding = 'utf8')
	videoId = body[body.find(matchId) + len(matchId):]
	videoTime = videoId[videoId.find(matchTime) + len(matchTime):]
	videoId = videoId[:videoId.find('"')]
	videoTime = videoTime[:videoTime.find('</span>')]

	print(videoId + " " + videoTime)
	return (videoId, videoTime)

def makeEntry(line, infile, outfile, currYear, vidId, vidTime):
	title, _, artist = line.partition('\t')
	if artist.endswith('\n'):
		artist = artist[:len(artist)-1]
	if currYear.endswith('\n'):
		currYear = currYear[:len(currYear)-1]

	outfile.write('        {\n            "title": "' + title + '",\n')
	outfile.write('            "artist": "' + artist + '",\n')
	outfile.write('            "year": ' + currYear + ',\n')
	outfile.write('            "vid": "' + vidId + '",\n')
	outfile.write('            "vtime": "' + vidTime + '"\n')
	return

def formJson():
	infile = open(sys.argv[1], 'r')
	outfile = open(sys.argv[2], 'w')
	print (sys.argv[2])

	outfile.write('{\n    "song": [\n')
	firstLine = True
	currYear = -1
	for line in infile:
		if (line.find('"') is -1):
			currYear = line
		else:
			if (not firstLine):
				outfile.write('        },\n')
			firstLine = False
			vidId, vidTime = getYoutubeId(line)
			makeEntry(line, infile, outfile, currYear, vidId, vidTime)
			# Wait some so as to not upset YouTube
			time.sleep(random.randint(2,9))
 
	outfile.write('        }\n    ]\n}')
	infile.close()
	outfile.close()

formJson()
