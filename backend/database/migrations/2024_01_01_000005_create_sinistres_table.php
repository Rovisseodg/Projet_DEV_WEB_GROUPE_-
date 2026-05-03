<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sinistres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('adherent_id')->constrained('adherents')->cascadeOnDelete();
            $table->text('description');
            $table->date('date_sinistre');
            $table->enum('type_sinistre', ['maladie', 'accident', 'décès', 'hospitalisation', 'autre']);
            $table->enum('statut', ['déclaré', 'en cours', 'approuvé', 'rejeté', 'remboursé'])->default('déclaré');
            $table->decimal('montant_reclamation', 10, 2)->nullable();
            $table->decimal('montant_remboursement', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sinistres');
    }
};
