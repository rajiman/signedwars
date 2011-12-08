import os
import Cookie
import datetime
import random
import time
import cgi

from google.appengine.api import users
from google.appengine.api import mail
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app


PROBS_PER_PAGE = '10'
PROB_RANGE = '20'
OP_MODE = 'addsub'
TIMES_MODE = '2'
EXP_MODE = '2'


class ProblemSet(db.Model):

    author    = db.UserProperty()
    value1    = db.ListProperty(int)
    value2    = db.ListProperty(int)
    operation = db.ListProperty(str)
    answer    = db.ListProperty(str)
    timer     = db.IntegerProperty()
    mode      = db.StringProperty()
    date      = db.DateTimeProperty(auto_now_add=True)
    checked   = db.BooleanProperty()

    expected  = []
    message   = []
    stats    = ''
    info     = 'test'
    status   = 'no'
    problems = [] #! array for webapp template

    def getProblems(self, op=OP_MODE, size=PROBS_PER_PAGE, range=[PROB_RANGE, PROB_RANGE], times=TIMES_MODE, exp=EXP_MODE):
    	random.seed()	
    	count = 0
	val1list = []
	val2list = []
	oplist   = []
	explist  = []
	anslist  = []
	msglist  = []
	prob_max = int(range[0])
	if (range[1] == 'off'):
	    prob_min = 1
	else:
	    prob_min = 0 - int(range[1])
    	while (count < int(size)):
	    if(op == 'addsub'):
    	    	val1list.append(random.randint(prob_min,prob_max))
    	    	val2 = 0
	    	while (val2 == 0): #exclude 0 from second operand
    	    	    val2 = random.randint(prob_min,prob_max)
    	    	val2list.append(val2)
	    	if(random.randint(0, 100) <= 50):
	    	    oplist.append(db.Text('+'))
	            explist.append(val1list[-1] + val2list[-1])
	    	else:
	    	    oplist.append(db.Text('-'))
	            explist.append(val1list[-1] - val2list[-1])

	    elif(op == 'muldiv'):
    	    	val2 = 0
	    	while (val2 == 0): #exclude 0 from second operand
    	    	    val2 = random.randint(prob_min,prob_max)
    	    	val2list.append(val2)
	    	if(random.randint(0, 100) <= 50):
    	    	    val1list.append(random.randint(prob_min,prob_max))
	    	    oplist.append(db.Text('&times;'))
	            explist.append(val1list[-1] * val2list[-1])
	    	else:
    	    	    explist.append(random.randint(prob_min,prob_max))
	    	    oplist.append(db.Text('&divide;'))
	            val1list.append(explist[-1] * val2list[-1])

	    elif(op == 'timestables'):
    	    	val1 = 0
	    	while (val1 == 0): #exclude 0 
    	    	    val1 = random.randint(prob_min,prob_max)
    	    	val1list.append(val1)

    	    	val2 = 0
	    	while (val2 == 0): #exclude 0
    	    	    val2 = random.randint(prob_min,prob_max)

		if (times == 'minmax'): #use min and max values
    	    	    val2list.append(val2)
		else:
    	    	    val2list.append(int(times))

	    	oplist.append(db.Text('&times;'))
	        explist.append(val1list[-1] * val2list[-1])

	    elif(op == 'exponents'):
    	    	val1list.append(random.randint(0,prob_max))

    	    	val2 = 0
	    	while (val2 == 0): #exclude 0
    	    	    val2 = random.randint(prob_min,prob_max)

		if (exp == 'minmax'): #use min and max values
    	    	    val2list.append(val2)
		else:
    	    	    val2list.append(int(exp))

	    	oplist.append(db.Text('^'))
	        explist.append(val2list[-1] ** val1list[-1])

	    anslist.append(db.Text(''))
	    msglist.append(db.Text('empty'))
	    count = count + 1

	self.author    = users.get_current_user()
	self.value1    = val1list
	self.value2    = val2list
	self.operation = oplist
	self.answer    = anslist
	self.timer     = 0
	self.checked   = False
	self.mode      = op
	self.expected  = explist
	self.message   = msglist

    def setMode(self, op=OP_MODE):
	self.mode = op

    def setExpected(self): #expected not stored in db
	explist = []
	for index, val in enumerate(self.value1):
	    if self.operation[index] == '+' :
	    	explist.append(self.value1[index] + self.value2[index])
	    elif self.operation[index] == '&times;' :
	    	explist.append(self.value1[index] * self.value2[index])
	    elif self.operation[index] == '&divide;' :
	    	explist.append(self.value1[index] / self.value2[index])
	    elif self.operation[index] == '^' :
	    	explist.append(self.value2[index] ** self.value1[index])
	    else:
	    	explist.append(self.value1[index] - self.value2[index])

	self.expected = explist

    def checkAnswers(self, mark='true'): # sets message, stats properties
	msglist = []
	correctcnt = 0
	for index, val in enumerate(self.answer):
	  try:
	    if(val == ''):
	    	msglist.append('empty')
	    elif(mark == 'false'):
	    	msglist.append('filled')
	    elif(int(val) == int(self.expected[index])):
	    	msglist.append('yes')
	    	correctcnt = correctcnt + 1
	    else:
	    	msglist.append('no')
	  except:
	    	msglist.append('noint')

	self.message = msglist
	self.stats   = str(correctcnt)

    def setStatus(self):
	self.status = 'new'
	for val in self.answer:
	    if(val != ''):
		self.status = 'active'
	if(self.status == 'active'):
	    self.status = 'done'
	    if '' in self.answer:
		self.status = 'active'
	if(self.status == 'new'):
	    self.clearStats()


    def clearStats(self):
	self.stats = ''

#offset is used for report generation for continuous numbering
    def setProblemSetVector(self, offset=0):
	prob = []
	problist = []
	for index, val in enumerate(self.value1):
	    prob  = [self.value1[index], self.operation[index], 
		     self.value2[index], self.expected[index], 
		     self.answer[index], self.message[index], index+offset+1]
	    problist.append(prob)


	self.problems = problist


class Records(db.Model):
    author     = db.UserProperty()

    masters       = []
    keys       = []
    problemvecs   = []
    statisticvecs = []
    showreport    = False
    length        = 0

    def __init__(self):
	self.author = users.get_current_user()

    	selectGql = "SELECT * FROM ProblemSet WHERE author = :author\
							ORDER BY date ASC"
    	self.masters = db.GqlQuery(selectGql, author=self.author)
	self.length  = self.masters.count()

# ???rkm why separate Gcl for keys?
    	selectGql = "SELECT __key__ FROM ProblemSet WHERE author = :author\
							ORDER BY date ASC"
    	self.keys = db.GqlQuery(selectGql, author=self.author)

    def setChecked(self): #Sets checked for all PSets(cleard individually)
	for index, master in enumerate(self.masters):
	    master.checked = True
	    master.put()

    def setStatistics(self, full='true'):
	probvecs = []
	statvecs = [] #[yescount,nocount,totalcount,%yes,%no,timer,opmode,key]
	statscnt = 0  #yescount for problem set
	nocnt    = 0  #nocount for problem set
	probscnt = 0
	timercnt = 0
	pageyes  = 0 #percent
	pageno   = 0 #percent
	totalyes = 0 #percent
	totalno  = 100 #percent
	#dont include current page in records if still new(not started)
	for index, master in enumerate(self.masters):
	    master.setExpected()
	    master.checkAnswers()
	    master.setStatus()
	    master.setProblemSetVector(probscnt) #template vector
	    if ( (index != (self.length - 1)) or \
			(master.status == 'done' ) or \
						(full=='true') ):
	    	probvecs.append(master.problems)	  
		if(master.stats == ''):
		    master.stats = 0
	    	statscnt = statscnt + int(master.stats)
	    	probscnt = probscnt + len(master.answer)
	    	timercnt = timercnt + int(master.timer)
		pageyes  = (int(master.stats) * 100) / len(master.answer)
		pageno   = 100 - pageyes
		nocnt    = len(master.answer) - int(master.stats)
		statvecs.append([int(master.stats), nocnt, len(master.answer), \
			pageyes, pageno, int(master.timer), master.mode, self.keys[index]])

	if(probscnt != 0): #overall statistics(insert at [0])
	    totalyes  = (statscnt * 100) / probscnt
	    totalno   = 100 - totalyes
	    nocnt     = probscnt - statscnt

	statvecs.insert(0,[statscnt, nocnt, probscnt, totalyes, totalno,\
							timercnt, 'overall', 'key'])
	#statvecs.reverse()

	self.problemvecs   = probvecs
	self.statisticvecs = statvecs

    def emailReport(self, report):
	yescount = self.statisticvecs[0][0]
	totcount = self.statisticvecs[0][1]
        sender_address = "<raji.mangewala@gmail.com>"
        user_address = self.author.email()
        subject = "Testing Mail Records"
	body = """Thank you for playing: %s %d out of %d  """ % (self.author, yescount, totcount)

	if mail.is_email_valid(user_address):
            mail.send_mail(sender_address, user_address, subject, body, \
			    		attachments=[('PSet.html', report)])
	    

    def deletePSets(self):
	for pset in self.masters:
	    pset.delete()

class MainPage(webapp.RequestHandler):

    def get(self):


	user = users.get_current_user()

	modes = self.getModeCookies()

	assig = []

        if not user:
            self.redirect(users.create_login_url(self.request.uri+'start'))

	elif (self.request.path == '/records'):

	    recs = Records()
	    recs.setStatistics()
	    recs.showreport = True

	    set = recs.masters[0]

	    MainPage.template_0(self, set, recs, modes)

	elif (self.request.path == '/page'): #non AJAX enabled

	    key = (self.request.get('pagekey'))
	    master = ProblemSet.get(key)

	    master.setExpected() #sets expected properties
	    master.checkAnswers() #sets message, stats properties
	    master.setStatus()
	    master.setProblemSetVector() #template vector
    	    master.info='testing1'

	    recs = Records() # Statistice used to distinguish views
	    recs.setStatistics()

	    MainPage.template_0(self, master, recs, modes)


	else:
	    recs = Records()
	    recs.setStatistics()
	    #status = 'no'
	    if(self.request.path == '/clear'):
		recs.deletePSets() #Login or (/clear url) deletes records

	    elif(self.request.path == '/start'):
		recs.deletePSets() #Login or (/clear url) deletes records

	    	set = ProblemSet() #get new PSet
	        set.setStatus()
	      	set.put()


	    recs = Records()
	    recs.setStatistics()


	    if( recs.masters.count(1) == 1 ):
	    	set = recs.masters[recs.length-1]
	    	set.setExpected()
	    	set.checkAnswers()
	    	set.setStatus() #if 'new' exists, use it 
		#status = set.status

	    #elif(status != 'new'): #if no 'new' exisits
    	    else: #no sets yet
	    	set = ProblemSet() #get new PSet
	    	set.getProblems(modes["op"], modes["size"], modes["range"],\
	    					modes["times"], modes["exp"])
	        set.setStatus()
	      	set.put()
	        recs = Records()
	        recs.setStatistics()

	    set.setProblemSetVector() #template vector
    	    set.info=assig

	    MainPage.template_0(self, set, recs, modes)

    def post(self):

	user = users.get_current_user()

	modes = self.getModeCookies()

	#check for new posted mode values
	newviewmode = self.request.get('viewmode')
	if newviewmode:
	    modes["view"] = newviewmode

	newpadmode = self.request.get('padmode') 
	if newpadmode:
	    modes["pad"] = newpadmode
	    
	newrunmode = self.request.get('runmode') 
	if newrunmode:
	    modes["run"] = newrunmode

	newtimermode = self.request.get('timermode')
	if newtimermode:
	    modes["timer"] = newtimermode


	expiration = datetime.datetime.now() + datetime.timedelta(days=30)
	viewcookie = 'viewmode='+modes["view"]+'; expires='\
			+expiration.strftime("%a, %d-%b-%Y %H:%M:%S PST")

	runcookie  = 'runmode='+modes["run"]+'; expires='\
			+expiration.strftime("%a, %d-%b-%Y %H:%M:%S PST")

	padcookie  = 'padmode='+modes["pad"]+'; expires='\
			+expiration.strftime("%a, %d-%b-%Y %H:%M:%S PST")

	timercookie = 'timermode='+modes["timer"]+'; expires='\
			+expiration.strftime("%a, %d-%b-%Y %H:%M:%S PST")


	self.response.headers.add_header('Set-Cookie', viewcookie)
	self.response.headers.add_header('Set-Cookie', runcookie)
	self.response.headers.add_header('Set-Cookie', padcookie)
	self.response.headers.add_header('Set-Cookie', timercookie)

	recs = Records() # Statistice used to distinguish views

	if(self.request.get('submit') == 'Check Answers'): 

	    key = (self.request.get('key'))
	    master = ProblemSet.get(key)

	    for index, val in enumerate(master.value1):
	    	ans = cgi.escape(self.request.get('answer'+str(index+1)))
	    	master.answer[index] = db.Text(str(ans))

	    master.setExpected() #sets expected properties
	    master.checkAnswers() #sets message, stats properties
	    if self.request.get('timer'):
	    	master.timer = int(self.request.get('timer'))
	    master.checked = True #for current pset statistics to display
	    master.put()
	    master.setStatus()
	    master.setProblemSetVector() #template vector
    	    master.info='testing1'
	    recs = Records() # Statistice used to distinguish views
	    recs.setChecked()
	    recs.setStatistics()

	    MainPage.template_0(self, master, recs, modes)

	elif(self.request.get('submit') == 'Radio'): #AJAX 

	    key = (self.request.get('key'))
	    master = ProblemSet.get(key)

	    master.setExpected() #sets expected properties
	    master.checkAnswers() #sets message, stats properties

	    #setExpected on stored answers only, not unchecked in form
	    for index, val in enumerate(master.value1):
	    	ans = cgi.escape(self.request.get('answer'+str(index+1)))
	    	master.answer[index] = db.Text(str(ans))

	    master.timer = int(self.request.get('timer'))
	    #master.put() #don't store uncheked answers
	    master.setStatus()
	    master.setProblemSetVector() #template vector
    	    master.info='testing1'
	    recs.setStatistics()

	    MainPage.template_0(self, master, recs, modes)

	elif((self.request.get('submit') == 'Clear Page      ') or \
	     (self.request.get('submit') == 'Clear Mistakes') ): 

	    key = (self.request.get('key'))
	    master = ProblemSet.get(key)

	    master.setExpected() #sets expected properties
	    master.checkAnswers() #sets message, stats properties
	    master.setStatus()

	    for index, val in enumerate(master.value1):
		if((master.message[index] == 'no') and\
						(master.status == 'done')):
	    	    master.answer[index] = ''
		elif((master.message[index] == 'yes') and\
		     				(master.checked == False)):
	    	    master.answer[index] = ''
		elif((master.message[index] == 'yes') and\
		     				(master.checked == True)):
	    	    pass
		elif(master.status == 'active'):
	    	    master.answer[index] = ''
		    master.timer = 0

	    master.checked = False
	    master.put()
	    #master.setExpected() #has not changed from above
	    master.setStatus()
	    if(master.checked == True):
	        master.checkAnswers()
	    else:
	        master.checkAnswers('false') #'false' use class='filled'
	    master.setProblemSetVector() #template vector
    	    master.info='testing1'

	    recs = Records() # Statistice used to distinguish views
	    recs.setStatistics()

	    MainPage.template_0(self, master, recs, modes)

    	elif(self.request.get('submit') == 'Add Page'):
		
	    key = (self.request.get('key'))
	    master = ProblemSet.get(key)

	    for index, val in enumerate(master.value1):
	    	ans = cgi.escape(self.request.get('answer'+str(index+1)))
	    	master.answer[index] = db.Text(str(ans))

	    master.setExpected() #sets expected properties
	    master.checkAnswers() #sets message, stats properties

	    if ((self.request.get('timer')) and (modes['timer'] == 'on') ):
	    	master.timer = int(self.request.get('timer'))

	    master.put()

	    set = ProblemSet() #get new PSet
	    set.getProblems(modes["op"], modes["size"], modes["range"],\
			    		modes["times"], modes["exp"])
	    set.setStatus()
	    set.put()
	    set.setProblemSetVector() #template vector
    	    set.info='testing2'

	    recs = Records() # Statistice used to distinguish views
	    recs.setStatistics()

	    MainPage.template_0(self, set, recs, modes)

    	elif(self.request.get('submit') == 'page'):
		
	    key = (self.request.get('key'))
	    master = ProblemSet.get(key)

	    for index, val in enumerate(master.value1):
	    	ans = cgi.escape(self.request.get('answer'+str(index+1)))
	    	master.answer[index] = db.Text(str(ans))

	    master.setExpected() #sets expected properties
	    master.checkAnswers() #sets message, stats properties

	    if ((self.request.get('timer')) and (modes['timer'] == 'on') ):
	    	master.timer = int(self.request.get('timer'))

	    master.put()

	    key = (self.request.get('pagekey'))
	    set = ProblemSet.get(key) 
	    set.setStatus()
	    set.setExpected()
	    if(set.checked == True):
	        set.checkAnswers()
	    else:
	        set.checkAnswers('false') #'false' use class='filled'
	    set.setProblemSetVector() #template vector
    	    set.info='testing2'

	    recs = Records() # Statistice used to distinguish views
	    recs.setStatistics()

	    MainPage.template_0(self, set, recs, modes)

    def template_0(self, pset, recs, modes):

	rangeopts = []
    	for num in range(1,21):
	    rangeopts.append(str(num))

	timesopts = []
    	for num in range(2,16):
	    timesopts.append(str(num))

	expopts = []
    	for num in range(1,11):
	    expopts.append(str(num))

        template_values = {
            'author': pset.author,
            #'value1': pset.value1,
	    #'value2': pset.value2,
            #'operation': pset.operation,
            'answer': pset.answer,	#debug only
            #'expected': pset.expected,
            'message': pset.message, #debug only
            'info': pset.info, #debug only
            'status': pset.status,
            'stats': pset.stats,
	    'key':pset.key(),
	    'timervalue':pset.timer,
	    'probsperpage':len(pset.answer),
	    'problems': pset.problems,
	    'viewmode':modes['view'],
	    'padmode':modes['pad'],
	    'runmode':modes['run'],
	    'timermode':modes['timer'],
	    'opmode':modes['op'],
	    'sizemode':modes['size'],
	    'rangemode':modes['range'],
	    'timesmode':modes['times'],
	    'expmode':modes['exp'],
	    'reportmode':modes['report'],
	    'rangeopts':rangeopts,
	    'timesopts':timesopts,
	    'expopts':expopts,
	    'showreport':recs.showreport,
	    'showcheck':pset.checked,
	    'probvecs': recs.problemvecs,
	    'statvecs': recs.statisticvecs,
	    'showdebug': 'false' #debug enable
	}


       	path = os.path.join(os.path.dirname(__file__), modes["view"]+'.html')
        self.response.out.write(template.render(path, template_values))

    def getModeCookies(self):
	viewmode = self.request.cookies.get("viewmode", '') 
	if not viewmode:
	    viewmode = 'horizontal'
	    
	padmode = self.request.cookies.get("padmode", '') 
	if not padmode:
	    padmode = 'off'
	    
	runmode = self.request.cookies.get("runmode", '') 
	if not runmode:
	    runmode = 'all'
	    
	timermode = self.request.cookies.get("timermode", '') 
	if not timermode:
	    timermode = 'on'
	    
	opmode = self.request.cookies.get("opmode", '') 
	if not opmode:
	    opmode = OP_MODE
	    
	sizemode = self.request.cookies.get("sizemode", '') 
	if not sizemode:
	    sizemode = PROBS_PER_PAGE
	    
	rangemode0 = self.request.cookies.get("rangemode0", '') 
	if not rangemode0:
	    rangemode0 = PROB_RANGE
	    
	rangemode1 = self.request.cookies.get("rangemode1", '') 
	if not rangemode1:
	    rangemode1 = PROB_RANGE
	    
	timesmode = self.request.cookies.get("timesmode", '') 
	if not timesmode:
	    timesmode = TIMES_MODE
	    
	expmode = self.request.cookies.get("expmode", '') 
	if not expmode:
	    expmode = EXP_MODE
	    
	reportmode0 = self.request.cookies.get("reportmode0", '') 
	if not reportmode0:
	    reportmode0 = 'practice'
	    
	reportmode1 = self.request.cookies.get("reportmode1", '') 
	if not reportmode1:
	    reportmode1 = 'answers'
	    
	reportmode2 = self.request.cookies.get("reportmode2", '') 
	if not reportmode2:
	    reportmode2 = 'statistics'

	#rangemode  = []
	rangemode  = [rangemode0, rangemode1]
	#reportmode = []
	reportmode = [reportmode0, reportmode1, reportmode2]
	    
	modes = {"view":viewmode, "pad":padmode, "run":runmode, "op":opmode,\
			"size":sizemode, "range":rangemode, "times":timesmode,\
			'exp':expmode, "report":reportmode, "timer":timermode}

	return modes


class Print(webapp.RequestHandler):

    def get(self):
	user = users.get_current_user()

	recs = Records()

	recs.setStatistics()

	#modes = getModeCookies()
	reportmode0 = self.request.cookies.get("reportmode0", '') 
	if not reportmode0:
	    reportmode0 = 'practice'
	    
	reportmode1 = self.request.cookies.get("reportmode1", '') 
	if not reportmode1:
	    reportmode1 = 'answers'
	    
	reportmode2 = self.request.cookies.get("reportmode2", '') 
	if not reportmode2:
	    reportmode2 = 'statistics'

	#reportmode = [reportmode0, reportmode1, reportmode2]

	if(recs.masters.count(1) != 0):
	    pset = recs.masters[0]
	    pset.setExpected()
	    pset.checkAnswers()
	    pset.setStatus()
	    pset.setProblemSetVector() #template vector
    	    pset.info='Testing'


            template_values = {
            	'author': pset.author,
	    	'statvecs':recs.statisticvecs,
	    	'probvecs':recs.problemvecs,
		'reportmode':[reportmode0, reportmode1, reportmode2],
	    	'printable':'true',
	    	'showreport':True,
	    	'showdebug': 'false', #debug enable
	    }



       	path = os.path.join(os.path.dirname(__file__), 'download.html')
        self.response.out.write(template.render(path, template_values))


class Logout(webapp.RequestHandler):

    def get(self):
	user = users.get_current_user()

	recs = Records()

	#recs.author = users.get_current_user()
	#recs.getProblemSets()
	recs.setStatistics()

	if(recs.masters.count(1) != 0):
	    pset = recs.masters[0]
	    pset.setExpected()
	    pset.checkAnswers()
	    pset.setStatus()
	    pset.setProblemSetVector() #template vector
    	    pset.info='Testing'


            template_values = {
            	'author': pset.author,
	    	'statvecs':recs.statisticvecs,
	    	'probvecs':recs.problemvecs,
	    	#'download':'true',
	    	'showdebug': 'false', #debug enable
	    }


	    if((recs.masters.count(2) != 1) or (pset.status != 'new')):
       	        path = os.path.join(os.path.dirname(__file__), 'download.html')
                html = template.render(path, template_values)
	    	recs.emailReport(html)

	    recs.deletePSets()

	self.redirect(users.create_logout_url('/'))

	
application = webapp.WSGIApplication(
                                     [('/', MainPage), 
				      ('/start', MainPage),
				      ('/check', MainPage), #posted
				      ('/clear', MainPage),
				      ('/records', MainPage),
				      ('/page', MainPage),
				      ('/printpreview', Print),
				      ('/print', Print),
				      ('/logout', Logout)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
