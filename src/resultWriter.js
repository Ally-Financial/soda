var pagerDuty = require('@pagerduty/pdjs');

ResultWriter = function () {
    var self           = this;

    this.init = function () {
        return self;
    };

    this.pagerDutyAPI = pagerDuty.api({token: 'pagerdutyapikey'});

    this.internalResult = {};

    this.processResults = async function(existingContents, result) {
        var finalResult = existingContents;

        if (!finalResult[result.name]) {
            finalResult[result.name] = result;
            if (!finalResult[result.name]["numberOfConsecutiveFailures"]) {
                finalResult[result.name]["numberOfConsecutiveFailures"] = 0;
            }
        }

        if (result.failed) {
            result["numberOfConsecutiveFailures"] = ++finalResult[result.name]["numberOfConsecutiveFailures"];
        }
        else {
            result["numberOfConsecutiveFailures"] = 0;
        }

        if (result["numberOfConsecutiveFailures"] == 3) {
            await this.startPagerDutyAlert(result);
        }
        else if (result["numberOfConsecutiveFailures"] == 0) {
            await this.stopPagerDutyAlert(existingContents[result.name]);
        }

        finalResult[result.name] = result;

        this.internalResult = finalResult;

        return this.internalResult;
    }

    this.getCurrent = function() {
        return this.internalResult;
    }

    this.startPagerDutyAlert = async function(result) {
        const incidentResponse = await this.pagerDutyAPI.post('incidents', {
            headers: {
                "From": "youremail@yourdomain.com",
            },
            data:{
                incident: {
                    type: 'incident',
                    title: result.description,
                    service: {id: 'YOURSERVICEREFERENCE', type: 'service_reference'},
                    urgency: 'high',
                    incident_key: JSON.stringify(result.failureid),
                    body: {
                      type: 'incident_body',
                      details: JSON.stringify(result.failureMessages)
                    }
                }
            } });

        result["pagerDutyIncidentId"] = incidentResponse.data.incident.id;
        result["pagerDutyIncident"] = incidentResponse.data.incident;
    }

    this.stopPagerDutyAlert = async function(result) {
        const incidentResponse = await this.pagerDutyAPI.put('/incidents/'+result.pagerDutyIncidentId, { 
            headers: {
                "From": "youremail@yourdomain.com",
            },
            data:{
                incident: {
                    type: 'incident_reference', 
                    status: 'resolved'
                }
            } });
    }
}

module.exports = new ResultWriter(); // Singleton