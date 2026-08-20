using Microsoft.EntityFrameworkCore;
using ApiHabitos.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar la base de datos PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));

// 2. Permitir la comunicación con Angular (CORS)
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirAngular", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 3. Registrar controladores
builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("PermitirAngular");
app.UseAuthorization();

// Ruta limpia para verificar desde el navegador sin dar error 404
app.MapGet("/", () => "¡Backend de Hábitos funcionando correctamente!");

app.MapControllers();

app.Run();