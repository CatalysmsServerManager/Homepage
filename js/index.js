const instances = ['eu', 'us', 'au'];
let totalServers = 0;
let totalPlayers = 0;
let historicalServers = {};

$(document).ready(async () => {

    for (const instance of instances) {
        let result = await getStatsForInstance(instance);
        totalPlayers += result[result.length - 1].players;
        totalServers += result[result.length - 1].servers;

        for (const dataObj of result) {
            const date = new Date(dataObj.createdAt);

            if (historicalServers[date.getUTCMonth() + "-" + date.getUTCDate()]) {
                historicalServers[date.getUTCMonth() + "-" + date.getUTCDate()].servers = historicalServers[date.getUTCMonth() + "-" + date.getUTCDate()].servers + dataObj.servers;
                historicalServers[date.getUTCMonth() + "-" + date.getUTCDate()].players = historicalServers[date.getUTCMonth() + "-" + date.getUTCDate()].players + dataObj.players;
            } else {
                historicalServers[date.getUTCMonth() + "-" + date.getUTCDate()] = dataObj;
            }
        }
    }
    const limitDate = new Date();
    delete historicalServers[limitDate.getUTCMonth() + "-" + limitDate.getUTCDate()]

    const historicalArray = [];

    for (const key of Object.keys(historicalServers)) {
        historicalArray.push(historicalServers[key])
    }
    historicalArray.splice(historicalArray.length - 1, 1)


    $('#totalServers').text(totalServers);
    $('#totalPlayers').text(totalPlayers);

    $('#stats').toggleClass('invisible')
    drawServerGraph(historicalArray);

});

function getStatsForInstance(instance) {
    return new Promise((resolve, reject) => {
        let date = new Date(Date.now());
        date = date.setMonth(date.getMonth() - 2)
        window.fetch(`https://${instance}.csmm.app/api/stats?since=${date.valueOf()}`).then(async response => {
                let result = await response.json();
                result = result.map(r => {
                    return {
                        createdAt: r.createdAt,
                        servers: r.servers,
                        players: r.players
                    }
                });
                resolve(result);
            })
            .catch(e => {
                console.error(e);
            })
    })

}

function drawServerGraph(dataArray) {

    const config = {
        type: 'line',
        data: {
            labels: dataArray.map(d => {
                let date = new Date(d.createdAt);
                return date.toLocaleDateString();
            }),
            datasets: [{
                label: 'Servers',
                backgroundColor: "rgb(54, 162, 235)",
                borderColor: "rgb(54, 162, 235)",
                data: dataArray.map(d => d.servers),
                fill: false,
                yAxisID: 'y-axis-1',
            },
            {
                label: 'Players',
                backgroundColor: "rgb(255, 159, 64)",
                borderColor: "rgb(255, 159, 64)",
                data: dataArray.map(d => d.players),
                fill: false,
                yAxisID: 'y-axis-2',
            }]
        },
        options: {
            responsive: true,
            title: {
                display: false,
                text: 'Chart.js Line Chart'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: 'Day'
                    }
                }],
                yAxes: [{
                    display: true,
                    type: 'linear',
                    position: 'left',
                    id: 'y-axis-1',
                    scaleLabel: {
                        display: true,
                        labelString: 'Servers'
                    }
                }, {
                    display: true,
                    type: 'linear',
                    position: 'right',
                    id: 'y-axis-2',
                    scaleLabel: {
                        display: true,
                        labelString: 'Players'
                    }
                }]
            }
        }
    };

    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);


}