<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('adherent_id')->constrained('adherents')->cascadeOnDelete();
            $table->decimal('montant', 10, 2);
            $table->decimal('taux_interet', 5, 2)->nullable();
            $table->integer('duree_mois');
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->enum('statut', ['en attente', 'approuvé', 'remboursé', 'rejeté'])->default('en attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prets');
    }
};
