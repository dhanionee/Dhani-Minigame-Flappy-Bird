RegisterCommand("minigame", function()
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "openGame",
        config = {
            playerSpeed = Config.PlayerSpeed,
            obstacleSpeedMin = Config.ObstacleSpeedMin,
            obstacleSpeedMax = Config.ObstacleSpeedMax,
            obstacleGapMin = Config.ObstacleGapMin,
            obstacleGapMax = Config.ObstacleGapMax,
            gameDuration = Config.GameDuration
        }
    })
end)



RegisterNUICallback("gameResult", function(data, cb)
    print("Game Selesai. Menang? ", data.success)
    SetNuiFocus(false, false)
    cb({})
end)
