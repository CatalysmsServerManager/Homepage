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
            } else {
                historicalServers[date.getUTCMonth() + "-" + date.getUTCDate()] = dataObj;
            }
        }
    }

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
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }]
            }
        }
    };

    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);


}