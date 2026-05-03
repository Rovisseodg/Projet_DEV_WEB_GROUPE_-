<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prestations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sinistre_id')->constrained('sinistres')->cascadeOnDelete();
            $table->string('type_prestation');
            $table->text('description')->nullable();
            $table->decimal('montant', 10, 2)->nullable();
            $table->date('date_demande');
            $table->date('date_approbation')->nullable();
            $table->enum('statut', ['déclaré', 'en cours', 'approuvé', 'rejeté', 'remboursé'])->default('déclaré');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prestations');
    }
};
