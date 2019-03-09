const instances = ['eu', 'us', 'au'];
let totalServers = 0;
let totalPlayers = 0;

$(document).ready(async () => {

    for (const instance of instances) {
        let result = await getStatsForInstance(instance);
        totalPlayers += result.players;
        totalServers += result.servers;

    }
    
    $('#totalServers').text(totalServers);
    $('#totalPlayers').text(totalPlayers);

    $('#stats').toggleClass('invisible')

});


function getStatsForInstance(instance) {
return new Promise((resolve, reject) => {
    window.fetch(`https://${instance}.csmm.app/api/stats`).then(async response => {
        let result = await response.json();
        resolve(result[result.length -1]);
    })
    .catch(e => {
        console.error(e);
    })
})

}