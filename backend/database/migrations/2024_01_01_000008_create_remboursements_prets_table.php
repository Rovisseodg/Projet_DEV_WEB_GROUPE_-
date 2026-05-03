<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('remboursements_prets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pret_id')->constrained('prets')->cascadeOnDelete();
            $table->integer('numero_echeance');
            $table->decimal('montant', 10, 2);
            $table->date('date_echeance');
            $table->date('date_paiement')->nullable();
            $table->string('statut')->default('en attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('remboursements_prets');
    }
};
