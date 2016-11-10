#wget https://www.padherder.com/api/active_skills/ -O active_skills.json
#wget https://www.padherder.com/api/awakenings/    -O - | python -m json.tool > awakenings.json
#wget https://www.padherder.com/api/evolutions/    -O - | python -m json.tool > evolutions.json
#wget https://www.padherder.com/api/leader_skills/ -O - | python -m json.tool > leader_skills.json
wget https://www.padherder.com/api/monsters/      -O - | python -m json.tool > monsters.json
