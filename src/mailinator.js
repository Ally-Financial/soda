MailinatorSupport = function () {
    const { MailinatorClient, GetInboxRequest, GetMessageRequest, DeleteMessageRequest } = require('mailinator-client');

    const mailinatorClient = new MailinatorClient("APIKEY");

    var self           = this;

    this.init = function () {
        return self;
    };

    this.getCode = async function(done, email, foundCode, retries) {
        console.log('getCode with email: ' + email);

        retries++;

        var messageTo;
        var messageId;

        mailinatorClient.request(
            new GetInboxRequest("mailinatordomain.com")
        ).then(            
            inboxResponse => {        
                result = inboxResponse.result.msgs.filter((item)=>{
                    return (
                    item.to === email &&
                    item.seconds_ago < 40 &&
                    item.subject === 'Your subject to match'
                    )
                })

                if (result[0]) {
                    result = result[0]
                }
                else {
                    result = false
                }

                if (result) {
                    messageTo = result.to;
                    messageId = result.id;

                    mailinatorClient.request(
                        new GetMessageRequest("mailinatordomain.com", result.to, result.id)
                    ).then(
                        messageResponse => {
                            result = messageResponse.result.parts;                                                    
        
                            if (result) {
                                body = result[0].body
                                var emailContentRegex = /Your code to match: (\d+)/im
                                var code = emailContentRegex.exec(body)[1] || ''

                                mailinatorClient.request(                                    
                                    new DeleteMessageRequest("mailinatordomain.com", null, messageId)
                                ).then(
                                    messageResponse => {
                                        foundCode.call(self, code);
                                        return self;
                                    }
                                )
                            }
                            else {
                                if (retries < 6) {                                    
                                    setTimeout(function() {
                                        self.getCode(done, email, foundCode, retries);
                                    }, 5000);                                    
                                }
                                else {
                                    done(self, new Error('Mailinator could not get code.'), null);
                                }
                                
                                return self;
                            }
                        }
                    )
                }
                else {
                    if (retries < 15) {                                    
                        setTimeout(function() {
                            self.getCode(done, email, foundCode, retries);
                        }, 5000);                                    
                    }
                    else {
                        done(self, new Error('Mailinator could not get code.'), null);
                    }
                    
                    return self;
                }
            }
        )
    }
}

module.exports = new MailinatorSupport(); // Singleton
