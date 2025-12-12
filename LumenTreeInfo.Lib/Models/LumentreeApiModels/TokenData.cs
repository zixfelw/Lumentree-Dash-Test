namespace LumenTreeInfo.Lib.Models.LumentreeApiModels;

public class TokenData
{
    public int Uid { get; set; }
    public string SvrPermission { get; set; }
    public string Nickname { get; set; }
    public int UserType { get; set; }
    public string ExpiredTime { get; set; }
    public string? Token { get; set; }
}